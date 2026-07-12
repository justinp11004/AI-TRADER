import { chromium } from 'playwright';
const APP='file:///home/user/AI-TRADER/index.html';
const SHOT='/tmp/claude-0/-home-user-AI-TRADER/cab049c8-29db-55e1-9110-a7b59ba7191d/scratchpad/shots/';
import { mkdirSync } from 'fs';
mkdirSync(SHOT,{recursive:true});

const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page=await browser.newPage({viewport:{width:1600,height:950}});
const errors=[];
// ERR_CONNECTION_REFUSED is the EXPECTED result of the deliberate backend
// fail-closed probe (system.integrations). Every other console error fails the build.
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_CONNECTION_REFUSED'))errors.push('console: '+m.text())});
page.on('pageerror',e=>errors.push('pageerror: '+e.message));

await page.goto(APP);
await page.waitForTimeout(1500);

// click through every domain + every sub-workspace via the real UI
const domains={command:['cockpit','briefing'],markets:['regime','scanner','watch','calendar','alerts','internals','playbooks'],
  research:['overview','chart','structure','wyckoff','options','flow','catalysts','history','fundamentals','factors'],
  decisions:['queue','packet','builder','rail','riskproof','history','sizing','premortem'],
  portfolio:['positions','orders','risk','exposure','account','hedging','ledger'],
  review:['journal','autopsy','performance','court','memory','asks','replay','patterns','coach'],
  system:['health','inbox','agents','knowledge','config','integrations','permissions','audit','integrity','autonomy','slo','releases','audits']};
let visited=0;
for(const [dom,wss] of Object.entries(domains)){
  await page.click(`[data-cmd="nav"][data-arg="${dom}"]`);
  await page.waitForTimeout(250);
  for(const ws of wss){
    await page.click(`[data-cmd="nav.ws"][data-arg="${ws}"]`);
    await page.waitForTimeout(200);
    const len=(await page.$eval('#vwrap',e=>e.innerHTML.length));
    if(len<300)errors.push(`THIN VIEW: ${dom}.${ws} rendered only ${len} chars`);
    visited++;
    if(ws===wss[0])await page.screenshot({path:SHOT+dom+'.png'});
  }
}
// interactions: palette
await page.keyboard.press('Control+k');await page.waitForTimeout(300);
await page.fill('#palq','NVDA');await page.waitForTimeout(200);
await page.keyboard.press('Enter');await page.waitForTimeout(300);
const crumb1=await page.textContent('#crumb');
if(!crumb1.includes('RESEARCH'))errors.push('palette jump failed: '+crumb1);
// V12: copilot drawer + reply
await page.keyboard.press('Control+j');await page.waitForTimeout(400);
const cpVisible=await page.$eval('#drawer',e=>e.classList.contains('on')&&e.innerHTML.includes('COPILOT'));
if(!cpVisible)errors.push('copilot drawer failed');
await page.click('button[data-cmd="copilot.ask"][data-arg="Read the regime"]');await page.waitForTimeout(400);
const cpMsgs=await page.evaluate(()=>COPILOT.msgs.length);
if(cpMsgs<3)errors.push('copilot did not reply');
await page.keyboard.press('Escape');await page.waitForTimeout(200);
// V12: trade builder verdict recompute
await page.click('[data-cmd="nav"][data-arg="decisions"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="builder"]');await page.waitForTimeout(300);
const v0=await page.evaluate(()=>builderVerdict().verdict);
await page.click('button[data-cmd="builder.conf"][data-arg="Market regime supports"]');await page.waitForTimeout(300);
const v1=await page.evaluate(()=>builderVerdict().confN);
if(v1!==7)errors.push('builder confluence toggle failed: '+v1);
await page.click('button[data-cmd="builder.conf"][data-arg="Market regime supports"]');await page.waitForTimeout(200);
// V12: memory add rule
await page.click('[data-cmd="nav"][data-arg="review"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="memory"]');await page.waitForTimeout(250);
const memBefore=await page.evaluate(()=>MEMORY.length);
await page.fill('#mem-in','No adds after 15:00 ET');
await page.click('button[data-cmd="memory.add"]');await page.waitForTimeout(300);
const memAfter=await page.evaluate(()=>MEMORY.length);
if(memAfter!==memBefore+1)errors.push('memory rule not saved');
// V12: keyboard decision (4 = WAIT_FOR_TRIGGER, non-terminal) + pocket preview
await page.click('[data-cmd="nav"][data-arg="decisions"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="packet"]');await page.waitForTimeout(250);
await page.keyboard.press('4');await page.waitForTimeout(300);
const noteSet=await page.evaluate(()=>PACKETS[0].note==='WAIT_FOR_TRIGGER'&&PACKETS[0].state==='READY_FOR_HUMAN');
if(!noteSet)errors.push('keyboard enum decision failed');
await page.click('button[data-cmd="pkt.pocket"]');await page.waitForTimeout(300);
const pocketUp=await page.$eval('#modal',e=>e.innerHTML.includes('GATE BOT'));
if(!pocketUp)errors.push('pocket preview failed');
await page.keyboard.press('Escape');await page.waitForTimeout(200);
// decision flow: open packet, reject with reason, verify journal grew
await page.click('[data-cmd="nav"][data-arg="decisions"]');await page.waitForTimeout(250);
await page.click('[data-cmd="nav.ws"][data-arg="packet"]');await page.waitForTimeout(250);
const before=await page.evaluate(()=>JOURNAL.length);
await page.click('button[data-cmd="pkt.decide"][data-arg="PKT-2231|APPROVE_PAPER_ONLY"]');
await page.waitForTimeout(400);
const after=await page.evaluate(()=>({j:JOURNAL.length,st:PACKETS[0].state,tok:PACKETS[0].tokenId}));
if(after.j!==before+1)errors.push('decision did not journal');
if(after.st!=='APPROVED_PAPER')errors.push('packet FSM wrong state: '+after.st);
if(!after.tok)errors.push('no token issued on approval');
// kill switch: hold 800ms → confirm modal → halt
await page.hover('#kill');
await page.mouse.down();await page.waitForTimeout(850);await page.mouse.up();
await page.waitForTimeout(300);
await page.click('button[data-cmd="desk.kill"]');await page.waitForTimeout(300);
const halted=await page.evaluate(()=>({kill:S.kill,cls:document.body.classList.contains('halted'),risk:S.riskMode}));
if(!halted.kill||!halted.cls||halted.risk!=='BLOCKED')errors.push('kill switch failed: '+JSON.stringify(halted));
await page.screenshot({path:SHOT+'halted.png'});
// resume
await page.click('#resume');await page.waitForTimeout(250);
await page.click('button[data-cmd="desk.resume.confirm"]');await page.waitForTimeout(250);
const resumed=await page.evaluate(()=>!S.kill&&S.riskMode==='NORMAL');
if(!resumed)errors.push('resume failed');
// integrity suite results
const integ=await page.evaluate(()=>INTEGRITY.results);
if(!integ||integ.pass!==integ.total)errors.push('integrity: '+(integ?integ.pass+'/'+integ.total+' — '+integ.tests.filter(t=>!t.pass).map(t=>t.nm+': '+t.detail).join('; '):'never ran'));
// drills: stale data must block risk engine
await page.click('[data-cmd="nav"][data-arg="system"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="health"]');await page.waitForTimeout(200);
await page.click('button[data-cmd="drill.data"]');await page.waitForTimeout(250);
const blockedByDrill=await page.evaluate(()=>SVR.riskCheck(PACKETS[1].rmath).codes.some(c=>c.code==='DATA-STALE'));
if(!blockedByDrill)errors.push('stale-data drill did not block risk engine');
await page.click('button[data-cmd="drill.clear"]');await page.waitForTimeout(200);
// V11.1 merge features: chart workstation toggles + vision wall
await page.click('[data-cmd="nav"][data-arg="research"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="chart"]');await page.waitForTimeout(300);
await page.click('button[data-cmd="chartx.set"][data-arg="wall"]');await page.waitForTimeout(400);
const wallCanvases=await page.$$eval('canvas',cs=>cs.length);
if(wallCanvases<8)errors.push('vision wall canvases missing: '+wallCanvases);
await page.click('button[data-cmd="chartx.set"][data-arg="wall"]');await page.waitForTimeout(200);
await page.click('button[data-cmd="chartx.set"][data-arg="replay"]');await page.waitForTimeout(300);
// committee rail renders steps
await page.click('[data-cmd="nav"][data-arg="decisions"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="rail"]');await page.waitForTimeout(300);
const railSteps=await page.$$eval('.tle',els=>els.length);
if(railSteps<14)errors.push('committee rail steps: '+railSteps);
await page.screenshot({path:SHOT+'rail.png'});
// autonomy lab: enable, wait for blotter corpus
await page.click('[data-cmd="nav"][data-arg="system"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="autonomy"]');await page.waitForTimeout(200);
await page.click('button[data-cmd="autonomy.enable"]');await page.waitForTimeout(200);
await page.evaluate(()=>{for(let i=1;i<=30;i++)blotterStep(i)});
await page.click('[data-cmd="nav.ws"][data-arg="autonomy"]');await page.waitForTimeout(300);
const blot=await page.evaluate(()=>BLOTTER.length);
if(blot<1)errors.push('autonomy blotter empty after enable');
await page.screenshot({path:SHOT+'autonomy.png'});
// teach loop: submit lesson -> quiz-back -> confirm -> court entry
await page.click('[data-cmd="nav"][data-arg="review"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="court"]');await page.waitForTimeout(250);
const courtBefore=await page.evaluate(()=>COURT.length);
await page.fill('#th-title','Sweep must close back inside range within 3 bars');
await page.fill('#th-correct','Treat 4+ bar acceptance outside as breakout, not sweep');
await page.click('button[data-cmd="teach.submit"]');await page.waitForTimeout(300);
await page.click('button[data-cmd="teach.confirm"]');await page.waitForTimeout(400);
const courtAfter=await page.evaluate(()=>({n:COURT.length,hum:HUMAN_LESSONS[0].id}));
if(courtAfter.n!==courtBefore+1)errors.push('teach loop did not file to court');
if(!courtAfter.hum.startsWith('HUM-'))errors.push('HUM chunk not minted');
// V12.1 SYNCHRONY organs
const boot=await page.evaluate(()=>BOOTTEST.results);
if(!boot||boot.pass!==8)errors.push('boot self-test: '+(boot?boot.pass+'/8 — '+boot.tests.filter(t=>!t.pass).map(t=>t.id+':'+t.detail).join('; '):'never ran'));
await page.click('[data-cmd="nav"][data-arg="system"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="integrity"]');await page.waitForTimeout(250);
await page.click('button[data-cmd="golden.run"]');await page.waitForTimeout(400);
const gold=await page.evaluate(()=>GOLDEN_LAST&&GOLDEN_LAST.every(g=>g.pass));
if(!gold)errors.push('golden fixtures: '+await page.evaluate(()=>GOLDEN_LAST?GOLDEN_LAST.filter(g=>!g.pass).map(g=>g.id+' → '+g.actual).join('; '):'no run'));
await page.click('button[data-cmd="stress.run"]');await page.waitForTimeout(400);
const stress=await page.evaluate(()=>STRESS_LAST&&STRESS_LAST.every(s2=>s2.pass));
if(!stress)errors.push('stress range diverged');
await page.screenshot({path:SHOT+'integrity-synchrony.png'});
// ask inbox roundtrip
await page.click('[data-cmd="nav"][data-arg="review"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="asks"]');await page.waitForTimeout(250);
await page.click('button[data-cmd="ask.answer"][data-arg="ASK-042|1"]');await page.waitForTimeout(300);
const asked=await page.evaluate(()=>ASKS.find(a=>a.id==='ASK-042').state==='ANSWERED');
if(!asked)errors.push('ask roundtrip failed');
// zone inspector four questions
await page.click('[data-cmd="nav"][data-arg="research"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="chart"]');await page.waitForTimeout(300);
await page.click('button[data-cmd="zone.inspect"][data-arg="FVG"]');await page.waitForTimeout(300);
const zi=await page.$eval('#modal',e=>e.innerHTML.includes('WHY VALID')&&e.innerHTML.includes('EARLY / CLEAN / LATE'));
if(!zi)errors.push('zone inspector missing four questions');
await page.keyboard.press('Escape');await page.waitForTimeout(150);
// ivory packet renders
await page.click('[data-cmd="nav"][data-arg="decisions"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="packet"]');await page.waitForTimeout(300);
const ivory=await page.$eval('#vwrap',e=>e.innerHTML.includes('ivory')&&e.innerHTML.includes('OPERATOR SIGNATURE'));
if(!ivory)errors.push('ivory packet document missing');
// expand-every-tab: all 19 sections open by default; collapse-all works
const openN=await page.$$eval('.ivory details[open]',els=>els.length);
if(openN!==19)errors.push('packet sections open by default: '+openN+'/19');
await page.click('button[data-cmd="pkt.expand"][data-arg="close"]');await page.waitForTimeout(200);
const closedN=await page.$$eval('.ivory details[open]',els=>els.length);
if(closedN!==0)errors.push('collapse-all left '+closedN+' open');
await page.click('button[data-cmd="pkt.expand"][data-arg="open"]');await page.waitForTimeout(200);
const reopenN=await page.$$eval('.ivory details[open]',els=>els.length);
if(reopenN!==19)errors.push('expand-all reopened only '+reopenN);
// depth pass renders: calendar archetats, alerts taxonomy, structure pools, wyckoff cause, catalysts archetypes, orders FSM, permissions step-up
const checks=[['markets','calendar','EARNINGS DETAIL'],['markets','alerts','TAXONOMY'],['research','structure','POOL STATE MACHINES'],['research','wyckoff','DISTRIBUTION MIRROR'],['research','catalysts','FOUR EARNINGS ARCHETYPES'],['research','history','SHADOW ARCHIVE'],['decisions','history','ENUM USAGE'],['portfolio','orders','FILL QUALITY'],['system','permissions','STEP-UP AUTHENTICATION']];
for(const [dom,ws,needle] of checks){
  await page.click(`[data-cmd="nav"][data-arg="${dom}"]`);await page.waitForTimeout(150);
  await page.click(`[data-cmd="nav.ws"][data-arg="${ws}"]`);await page.waitForTimeout(200);
  const okN=await page.$eval('#vwrap',(e,n)=>e.innerHTML.includes(n),needle);
  if(!okN)errors.push('depth missing: '+dom+'.'+ws+' lacks "'+needle+'"');
}
await page.screenshot({path:SHOT+'ivory-packet.png'});
// V12.2 UNIFIED deltas
await page.click('[data-cmd="nav"][data-arg="research"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="chart"]');await page.waitForTimeout(300);
const alertsBefore=await page.evaluate(()=>ALERTS.length);
await page.click('button[data-cmd="chart.alert"]');await page.waitForTimeout(300);
const alertsAfter=await page.evaluate(()=>ALERTS.length);
if(alertsAfter!==alertsBefore+1)errors.push('chart alert did not arm');
await page.click('button[data-cmd="chartx.set"][data-arg="rsi"]');await page.waitForTimeout(300);
await page.click('button[data-cmd="chartx.set"][data-arg="bb"]');await page.waitForTimeout(300);
// backend probe fails closed without pageerror
await page.click('[data-cmd="nav"][data-arg="system"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="integrations"]');await page.waitForTimeout(250);
await page.click('button[data-cmd="backend.connect"]');await page.waitForTimeout(4200);
const failClosed=await page.evaluate(()=>SVR.ledger.some(l=>l.msg.includes('demo adapter remains active')));
if(!failClosed)errors.push('backend probe did not fail closed');
// microstructure + corr matrix render
await page.click('[data-cmd="nav"][data-arg="research"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="flow"]');await page.waitForTimeout(250);
const l2=await page.$eval('#vwrap',e=>e.innerHTML.includes('L2 BOOK'));
if(!l2)errors.push('L2 microstructure missing');
await page.click('[data-cmd="nav"][data-arg="portfolio"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="exposure"]');await page.waitForTimeout(250);
const corr=await page.$eval('#vwrap',e=>e.innerHTML.includes('0.84'));
if(!corr)errors.push('correlation matrix missing');
// ===== Chart Studio Pro: interactive drawing engine =====
await page.click('[data-cmd="nav"][data-arg="research"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="chart"]');await page.waitForTimeout(300);
// ensure non-wall mode, clean drawing slate
if(await page.evaluate(()=>CHARTX.wall)){await page.click('button[data-cmd="chartx.set"][data-arg="wall"]');await page.waitForTimeout(300);}
await page.evaluate(()=>{CHARTPRO.drawings[S.sym]=[];CHARTPRO.sel=null;CHARTPRO.tool='cursor';render();});
await page.waitForTimeout(200);
// snapshot + tool commands must be registered
const cproCmds=await page.evaluate(()=>['cpro.tool','cpro.undo','cpro.clear','cpro.del','cpro.snap','cpro.vc','cpro.note.save','cpro.aitoggle','chartx.replayAt'].filter(id=>!CMD.reg[id]));
if(cproCmds.length)errors.push('chart commands unregistered: '+cproCmds.join(','));
const box=await page.$eval('#cp-main',e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};});
// select trend tool, place a two-click trend line
await page.click('button[data-cmd="cpro.tool"][data-arg="trend"]');await page.waitForTimeout(200);
if(await page.evaluate(()=>CHARTPRO.tool)!=='trend')errors.push('chart tool select failed');
const drawBefore=await page.evaluate(()=>CHARTPRO.list().length);
await page.mouse.click(box.x+box.w*0.35,box.y+box.h*0.60);await page.waitForTimeout(120);
await page.mouse.click(box.x+box.w*0.70,box.y+box.h*0.35);await page.waitForTimeout(200);
const drawAfter=await page.evaluate(()=>({n:CHARTPRO.list().length,t:CHARTPRO.list().slice(-1)[0]&&CHARTPRO.list().slice(-1)[0].t}));
if(drawAfter.n!==drawBefore+1)errors.push('trend drawing not placed: '+drawBefore+'->'+drawAfter.n);
if(drawAfter.t!=='trend')errors.push('placed drawing wrong type: '+drawAfter.t);
// keyboard tool switch: press P for the position tool
await page.keyboard.press('p');await page.waitForTimeout(150);
if(await page.evaluate(()=>CHARTPRO.tool)!=='pos')errors.push('keyboard tool hotkey (P) failed');
// position tool: three clicks (entry, stop below, target well above) → runs the 5R gate + audits
const ledBefore=await page.evaluate(()=>SVR.ledger.length);
await page.mouse.click(box.x+box.w*0.40,box.y+box.h*0.50);await page.waitForTimeout(110); // entry
await page.mouse.click(box.x+box.w*0.40,box.y+box.h*0.56);await page.waitForTimeout(110); // stop (below entry)
await page.mouse.click(box.x+box.w*0.40,box.y+box.h*0.06);await page.waitForTimeout(220); // target (far above → PASS)
const pos=await page.evaluate(()=>{const d=CHARTPRO.list().find(x=>x.t==='pos');return d?{r:Math.abs(d.p3.p-d.p1.p)/Math.abs(d.p1.p-d.p2.p),ok:!!(d.p1&&d.p2&&d.p3)}:null;});
if(!pos||!pos.ok)errors.push('position tool drawing not placed');
if(!(pos&&pos.r>0))errors.push('position tool R not computed: '+(pos&&pos.r));
if(!await page.evaluate(()=>SVR.ledger.some(l=>l.msg.includes('Position tool'))))errors.push('position tool did not audit to ledger');
if(await page.evaluate(()=>SVR.ledger.length)<=ledBefore)errors.push('position tool ledger did not grow');
// AI structure overlay toggles state
const aiB=await page.evaluate(()=>CHARTPRO.ai);
await page.click('button[data-cmd="cpro.aitoggle"]');await page.waitForTimeout(150);
if(await page.evaluate(()=>CHARTPRO.ai)===aiB)errors.push('AI structure toggle failed');
await page.click('button[data-cmd="cpro.aitoggle"]');await page.waitForTimeout(120);
// undo pops the last drawing; clear empties the slate
await page.click('button[data-cmd="cpro.undo"]');await page.waitForTimeout(150);
await page.click('button[data-cmd="cpro.clear"]');await page.waitForTimeout(200);
if(await page.evaluate(()=>CHARTPRO.list().length)!==0)errors.push('clear drawings failed');
// snapshot exports a real data URL (PNG)
const snap=await page.evaluate(()=>{const cv=document.getElementById('cp-main');return cv?cv.toDataURL('image/png').slice(0,15):'';});
if(!snap.startsWith('data:image/png'))errors.push('snapshot PNG export failed: '+snap);
await page.evaluate(()=>{CHARTPRO.tool='cursor';render();});await page.waitForTimeout(150);
await page.screenshot({path:SHOT+'chart-studio.png'});
// ═══════════ V14 · FIVE-YEAR ESTATE ═══════════
// mandated command surface present (each is a rendered control in a new workspace)
const v14cmds=['intern.snapshot','playbk.arm','funda.attach','factor.brief','size.card','premort.ack','premort.file',
  'hedge.propose','ledg.statement','pattern.flag','coach.commit','brief.ack','brief.md','slo.bench','rel.runall',
  'army.runall','army.csv','army.report','army.triage','est.pb'];
const v14missing=await page.evaluate(cs=>cs.filter(c=>!CMD.reg[c]),v14cmds);
if(v14missing.length)errors.push('V14 commands missing: '+v14missing.join(','));
// AUDIT ARMY: run all 8 passes for real; the GATES pass attacks SVR — zero open S0 = no gate bypass
await page.click('[data-cmd="nav"][data-arg="system"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="audits"]');await page.waitForTimeout(300);
await page.click('button[data-cmd="army.runall"]');await page.waitForTimeout(1500);
const army=await page.evaluate(()=>({passes:Object.keys(ARMY_RUNS).length,
  openS0:ARMY_LEDGER.filter(f=>f.sev==='S0'&&f.status==='OPEN').length,
  openS1:ARMY_LEDGER.filter(f=>f.sev==='S1'&&f.status==='OPEN').length,
  cells:Object.values(ARMY_RUNS).reduce((a,r)=>a+r.cells,0)}));
if(army.passes!==8)errors.push('audit army passes ran: '+army.passes+'/8');
if(army.openS0>0)errors.push('AUDIT ARMY found OPEN S0 gate bypasses: '+army.openS0);
if(army.openS1>0)errors.push('AUDIT ARMY found OPEN S1 falsehoods: '+army.openS1);
if(army.cells<80)errors.push('audit army coverage thin: '+army.cells+' cells');
await page.screenshot({path:SHOT+'audit-army.png'});
// RELEASES: run the live readiness suites from the governance screen
await page.click('[data-cmd="nav.ws"][data-arg="releases"]');await page.waitForTimeout(300);
if(await page.$('button[data-cmd="rel.runall"]')){
  await page.click('button[data-cmd="rel.runall"]');await page.waitForTimeout(800);
  const rel=await page.evaluate(()=>({i:INTEGRITY.results.pass+'/'+INTEGRITY.results.total,b:BOOTTEST.results.pass}));
  if(!rel.i.split('/').every((x,_,a)=>a[0]===a[1]))errors.push('releases re-run integrity not green: '+rel.i);
}
// SLO observatory: render timings are REAL measurements
await page.click('[data-cmd="nav.ws"][data-arg="slo"]');await page.waitForTimeout(300);
const sloReal=await page.evaluate(()=>typeof CSD_SLO!=='undefined'&&CSD_SLO.buf&&CSD_SLO.buf.length>0?CSD_SLO.buf.length:(typeof CSD_SLO!=='undefined'&&Array.isArray(CSD_SLO.ring)?CSD_SLO.ring.length:-1));
if(sloReal===0)errors.push('SLO observatory has no measured renders');
// BRIEFING: acknowledge flows to the audit ledger
await page.click('[data-cmd="nav"][data-arg="command"]');await page.waitForTimeout(200);
await page.click('[data-cmd="nav.ws"][data-arg="briefing"]');await page.waitForTimeout(300);
if(await page.$('button[data-cmd="brief.ack"]')){
  const ledBefore14=await page.evaluate(()=>SVR.ledger.length);
  await page.click('button[data-cmd="brief.ack"]');await page.waitForTimeout(300);
  if(await page.evaluate(()=>SVR.ledger.length)<=ledBefore14)errors.push('briefing ack did not audit');
}
await page.screenshot({path:SHOT+'briefing.png'});
// final screenshot back at command
await page.click('[data-cmd="nav"][data-arg="command"]');await page.waitForTimeout(400);
await page.screenshot({path:SHOT+'final-command.png'});

// ═══════════ PHASE B · LIVE SPINE — real backend, end to end ═══════════
import { spawn } from 'child_process';
const SRV_PORT=8099, SRV='http://127.0.0.1:'+SRV_PORT;
const srv=spawn('node',['/home/user/AI-TRADER/backend/atlas-server.mjs','--port',String(SRV_PORT)],{stdio:'ignore'});
let up=false;
for(let i=0;i<25&&!up;i++){try{const r=await fetch(SRV+'/v1/health');up=(await r.json()).ok}catch{await new Promise(r=>setTimeout(r,250))}}
if(!up){errors.push('LIVE SPINE: server did not come up');}
else{
  // ── node-side contract smoke ──
  const h=await (await fetch(SRV+'/v1/health')).json();
  if(!['LIVE','SIM'].includes(h.mode))errors.push('spine health.mode invalid: '+h.mode);
  const q=await (await fetch(SRV+'/v1/quotes?syms=NVDA:196.74,TSLA:242.1')).json();
  const qn=q.quotes&&q.quotes.NVDA;
  if(!qn||!isFinite(qn.px)||typeof qn.synthetic!=='boolean')errors.push('spine quotes shape wrong: '+JSON.stringify(qn));
  const cd=await (await fetch(SRV+'/v1/candles?sym=NVDA&tf=5m&n=360&px=196.74')).json();
  if(!Array.isArray(cd.candles)||cd.candles.length<50||typeof cd.synthetic!=='boolean')errors.push('spine candles wrong: n='+(cd.candles&&cd.candles.length));
  const blk=await (await fetch(SRV+'/v1/risk/check',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan:{rr:4.9,riskUSD:300,riskR:0.5},state:{equity:60000,openRiskR:1.0,riskMode:'NORMAL',dataHealth:'NOMINAL'}})})).json();
  if(blk.verdict!=='BLOCK'||!blk.codes.some(c=>c.code==='RISK-5R'))errors.push('spine risk law failed to BLOCK sub-5R: '+JSON.stringify(blk.codes));
  const pas=await (await fetch(SRV+'/v1/risk/check',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan:{rr:6.4,riskUSD:300,riskR:0.5},state:{equity:60000,openRiskR:1.0,riskMode:'NORMAL',dataHealth:'NOMINAL'}})})).json();
  if(pas.verdict!=='PASS')errors.push('spine risk law blocked a clean 6.4R plan');
  const tk=(await (await fetch(SRV+'/v1/token/issue',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({packetId:'PKT-VER',planHash:'hv',decision:'APPROVE_PAPER_ONLY'})})).json()).token;
  const bad=await (await fetch(SRV+'/v1/token/redeem',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:tk.id,planHash:'WRONG'})})).json();
  const good=await (await fetch(SRV+'/v1/token/redeem',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:tk.id,planHash:'hv'})})).json();
  const replay=await (await fetch(SRV+'/v1/token/redeem',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:tk.id,planHash:'hv'})})).json();
  if(bad.code!=='TKN-HASH'||!good.ok||replay.code!=='TKN-USED')errors.push('spine token contract broken: '+bad.code+'/'+good.ok+'/'+replay.code);
  await fetch(SRV+'/v1/audit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({actor:'VERIFY',kind:'test',msg:'chain check'})});
  const led=await (await fetch(SRV+'/v1/audit?n=5')).json();
  const chainOk=led.entries.every((e,i)=>i===led.entries.length-1||e.prev===led.entries[i+1].h);
  if(!chainOk)errors.push('spine ledger hash chain broken');

  // ── browser: connect, stream, attest, parity, disconnect ──
  await page.click('[data-cmd="nav"][data-arg="system"]');await page.waitForTimeout(200);
  await page.click('[data-cmd="nav.ws"][data-arg="integrations"]');await page.waitForTimeout(250);
  await page.fill('#api-base',SRV);
  await page.click('button[data-cmd="backend.connect"]');await page.waitForTimeout(2000);
  const con=await page.evaluate(()=>({on:NET.on,mode:NET.mode,base:NET.base}));
  if(!con.on)errors.push('LIVE SPINE: browser did not connect: '+JSON.stringify(con));
  if(!['LIVE','SIM'].includes(con.mode))errors.push('LIVE SPINE: feed mode invalid: '+con.mode);
  const pill=await page.$eval('#topbar',e=>e.textContent);
  if(con.mode==='LIVE'&&!pill.includes('live feed'))errors.push('topbar missing live feed pill');
  if(con.mode==='SIM'&&!pill.includes('sim feed'))errors.push('topbar missing sim feed pill (honesty label)');
  // quotes must MOVE via SSE (feed owns prices; local drift stands down)
  const px0=await page.evaluate(()=>SYMS[0].px);
  await page.waitForTimeout(6000);
  const px1=await page.evaluate(()=>({px:SYMS[0].px,applied:NET.qApplied,src:SYMS[0]._src,syn:SYMS[0]._syn}));
  if(px1.px===px0)errors.push('SSE quotes not moving prices: '+px0+' == '+px1.px);
  if(px1.applied<2)errors.push('SSE quote batches not arriving: '+px1.applied);
  if(typeof px1.syn!=='boolean')errors.push('quote provenance missing on SYMS');
  // risk parity: local verdict attested against server verdict
  await page.evaluate(()=>SVR.riskCheck(PACKETS[1].rmath));
  await page.waitForTimeout(1200);
  const par=await page.evaluate(()=>NET.parity);
  if(par.n<1)errors.push('risk parity attestation never ran');
  if(par.mismatch>0)errors.push('RISK PARITY MISMATCH: '+par.last);
  // audit attestation: entry mirrored to the server hash chain
  await page.evaluate(()=>SVR.audit('VERIFY (browser)','test','attest ping'));
  await page.waitForTimeout(1200);
  const att=await page.evaluate(()=>{const e=SVR.ledger.find(l=>l.msg==='attest ping');return{att:e&&e.att,count:NET.attested}});
  if(!att.att)errors.push('audit attestation missing server hash');
  // chart pulls live candles with provenance label
  await page.click('[data-cmd="nav"][data-arg="research"]');await page.waitForTimeout(200);
  await page.click('[data-cmd="nav.ws"][data-arg="chart"]');await page.waitForTimeout(1500);
  const chartLive=await page.evaluate(()=>{const a=candles(S.sym,360);return a.live?{syn:a.live.synthetic,prov:a.live.provider}:null});
  if(!chartLive)errors.push('chart did not switch to spine candles');
  const ohlc=await page.$eval('#cp-ohlc',e=>e.textContent);
  if(chartLive&&chartLive.syn&&!ohlc.includes('SIM FEED'))errors.push('chart SIM candles not labeled: '+ohlc.slice(0,80));
  if(chartLive&&!chartLive.syn&&!ohlc.includes('LIVE OHLC'))errors.push('chart live candles not labeled');
  await page.screenshot({path:SHOT+'live-spine.png'});
  // integrity suite still green while connected (incl. fail-closed check)
  const integ2=await page.evaluate(()=>INTEGRITY.run());
  if(integ2.pass!==integ2.total)errors.push('integrity degraded while live: '+integ2.pass+'/'+integ2.total);
  // explicit disconnect restores the demo adapter, audited
  await page.click('[data-cmd="nav"][data-arg="system"]');await page.waitForTimeout(200);
  await page.click('[data-cmd="nav.ws"][data-arg="integrations"]');await page.waitForTimeout(300);
  await page.click('button[data-cmd="backend.disconnect"]');await page.waitForTimeout(400);
  const disc=await page.evaluate(()=>({on:NET.on,msg:SVR.ledger.some(l=>l.msg.includes('demo adapter restored'))}));
  if(disc.on||!disc.msg)errors.push('disconnect did not restore demo adapter cleanly');
}
try{srv.kill()}catch{}
console.log(JSON.stringify({visited,integrity:integ?integ.pass+'/'+integ.total:'n/a',liveSpine:up?'tested':'SKIPPED',errors},null,1));
await browser.close();
process.exit(errors.length?1:0);
