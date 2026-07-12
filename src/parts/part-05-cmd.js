/* ═══════════ CMD · command registry — the button contract ═══════════
   Every interactive control binds to a registered command via
   data-cmd + data-arg. No inline onclick anywhere. A command declares:
   id · label · purpose · permission · preconditions() · run() · audit.
   Controls whose preconditions fail render disabled WITH THE REASON.
   One delegated listener wires the whole app. */
const CMD={
  reg:{},
  define(def){this.reg[def.id]=def},
  can(id,arg){
    const c=this.reg[id];if(!c)return{ok:false,why:'Command not registered: '+id};
    if(c.pre){const why=c.pre(arg);if(why)return{ok:false,why}}
    return{ok:true};
  },
  run(id,arg,el){
    const c=this.reg[id];
    if(!c){UI.toast('Unwired control — '+id,'blk','INTEGRITY');console.error('missing cmd',id);return}
    const gate=this.can(id,arg);
    if(!gate.ok){UI.toast(gate.why,'warn',c.label);return}
    if(c.audit!==false)SVR.audit('HUMAN (owner)','cmd',c.label+(arg?' · '+arg:''));
    c.run(arg,el);
  },
  /* button HTML helper — resolves precondition state at render time */
  btn(id,arg,cls,labelOverride){
    const c=this.reg[id];if(!c)return'<button class="btn '+(cls||'')+'" disabled data-blocked="Command not registered">'+U.esc(id)+'</button>';
    const gate=this.can(id,arg);
    const label=labelOverride||c.label;
    if(gate.ok)return'<button class="btn '+(cls||'')+'" data-cmd="'+id+'"'+(arg!=null?' data-arg="'+U.esc(arg)+'"':'')+' title="'+U.esc(c.purpose)+'">'+label+'</button>';
    return'<button class="btn '+(cls||'')+'" disabled data-blocked="'+U.esc(gate.why)+'">'+label+'</button>';
  },
};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-cmd]');
  if(el&&!el.disabled){e.preventDefault();CMD.run(el.dataset.cmd,el.dataset.arg,el)}
});

/* ═══════════ UI · shell chrome, router, overlays ═══════════ */
const UI={
  toast(msg,cls,kicker){
    const d=document.createElement('div');d.className='toast '+(cls||'');
    d.innerHTML=(kicker?'<div class="tt2">'+U.esc(kicker)+'</div>':'')+U.esc(msg);
    $('#toasts').appendChild(d);setTimeout(()=>{d.style.opacity='0';d.style.transition='opacity .3s';setTimeout(()=>d.remove(),320)},4200);
  },
  drawer(html){$('#drawer').innerHTML=html;$('#drawer').classList.add('on');$('#scrim').classList.add('on')},
  closeDrawer(){$('#drawer').classList.remove('on');$('#scrim').classList.remove('on')},
  modal(title,body,foot){$('#modal').innerHTML='<div class="mh">'+title+'</div><div class="mb">'+body+'</div>'+(foot?'<div class="mf">'+foot+'</div>':'');$('#modal-scrim').classList.add('on')},
  closeModal(){$('#modal-scrim').classList.remove('on')},
};
$('#scrim').addEventListener('click',()=>{UI.closeDrawer();Palette.close()});
$('#modal-scrim').addEventListener('click',e=>{if(e.target.id==='modal-scrim')UI.closeModal()});

/* router: domain → workspace → optional entity arg */
function go(domain,ws,arg){
  const d=DOMAINS[domain];if(!d)return;
  const wsId=ws&&d.ws.find(w=>w.id===ws)?ws:d.ws[0].id;
  STORE.set({domain,ws:wsId,wsArg:arg??null});
  UI.closeDrawer();UI.closeModal();Palette.close();
  render();
  $('#view').scrollTop=0;
}
