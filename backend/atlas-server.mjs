#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   ATLAS PRIME · LIVE SPINE — real backend, zero dependencies (Node ≥ 18)

   Run:            node backend/atlas-server.mjs            (port 8000)
                   node backend/atlas-server.mjs --port 8087
   Then open index.html and press "Connect backend" in SYSTEM → Integrations.

   Honesty contract (LAW-006 · LAW-015, server side):
   · Real quotes/candles come from public providers (Stooq, Yahoo chart API),
     strictly validated. Every payload carries {synthetic, provider, asof}.
   · If no provider is reachable the server KEEPS SERVING — but every value
     is stamped synthetic:true and health.mode reads "SIM". The client
     renders that label verbatim. Synthetic data is never presented as live.
   · Risk law, tokens, and the audit ledger are enforced HERE, not in the
     browser. The ledger is hash-chained and persisted append-only.
   ═══════════════════════════════════════════════════════════════════════ */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argPort = process.argv.indexOf('--port');
const PORT = argPort > -1 ? +process.argv[argPort + 1] : (+process.env.ATLAS_PORT || 8000);
const VERSION = 'atlas-live-spine/1.0.0';
const BOOT = Date.now();

/* ── numeric truth (mirror of atlas_config.yaml — LAW-015) ── */
const CONFIG = {
  'risk.max_trade_risk_pct': 1.0,
  'risk.max_open_risk_R': 3.0,
  'risk.min_rr': 5.0,
  'risk.max_sector_exposure': 2.5,
  'risk.event_window_hrs': 24,
  'options.max_spread_pct': 8.0,
  'token.ttl_sec': 120,
};

/* ── persistent, hash-chained audit ledger ── */
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const LEDGER_FILE = path.join(DATA_DIR, 'ledger.jsonl');
const ledger = []; // in-memory tail (most recent last)
let seq = 0;
try {
  const lines = fs.readFileSync(LEDGER_FILE, 'utf8').trim().split('\n').filter(Boolean);
  for (const ln of lines) { const e = JSON.parse(ln); ledger.push(e); seq = Math.max(seq, e.seq); }
  if (ledger.length > 2000) ledger.splice(0, ledger.length - 2000);
} catch { /* fresh ledger */ }
const sha8 = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
function audit(actor, kind, msg) {
  const prev = ledger.length ? ledger[ledger.length - 1].h : 'GENESIS';
  const e = { seq: ++seq, t: new Date().toISOString(), actor, kind, msg, prev, h: '' };
  e.h = sha8(prev + '|' + e.seq + '|' + e.t + '|' + actor + '|' + kind + '|' + msg);
  ledger.push(e);
  if (ledger.length > 2000) ledger.shift();
  fs.appendFile(LEDGER_FILE, JSON.stringify(e) + '\n', () => {});
  return e;
}

/* ── deterministic per-symbol PRNG for the SIM fallback ── */
function rngFor(key) {
  let s = 0;
  for (let i = 0; i < key.length; i++) s = (Math.imul(s, 31) + key.charCodeAt(i)) >>> 0;
  return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ── provider chain: Stooq (quotes) · Yahoo chart API (quotes + candles) ── */
async function timedFetch(url, ms = 8000) {
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctl.signal, headers: { 'user-agent': 'atlas-live-spine/1.0' } });
    const text = await res.text();
    return { status: res.status, text };
  } finally { clearTimeout(to); }
}

async function stooqQuote(sym) {
  // CSV: Symbol,Date,Time,Open,High,Low,Close,Volume — validated strictly
  const { status, text } = await timedFetch(`https://stooq.com/q/l/?s=${sym.toLowerCase()}.us&f=sd2t2ohlcv&h&e=csv`);
  if (status !== 200) throw new Error('stooq HTTP ' + status);
  const rows = text.trim().split('\n');
  if (rows.length < 2 || !/^Symbol,Date,Time,Open/.test(rows[0])) throw new Error('stooq: unexpected payload');
  const c = rows[1].split(',');
  const close = parseFloat(c[6]), open = parseFloat(c[3]);
  if (!isFinite(close) || close <= 0) throw new Error('stooq: N/D for ' + sym);
  return { px: close, chgPct: isFinite(open) && open > 0 ? (close - open) / open * 100 : 0, asof: c[1] + ' ' + c[2], provider: 'stooq', synthetic: false };
}

async function yahooChart(sym, interval, range) {
  const { status, text } = await timedFetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${interval}&range=${range}`);
  if (status !== 200) throw new Error('yahoo HTTP ' + status);
  let j; try { j = JSON.parse(text); } catch { throw new Error('yahoo: non-JSON payload'); }
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r || !r.timestamp || !r.indicators || !r.indicators.quote || !r.indicators.quote[0]) throw new Error('yahoo: unexpected shape');
  return r;
}

async function yahooQuote(sym) {
  const r = await yahooChart(sym, '1d', '5d');
  const m = r.meta;
  if (!m || !isFinite(m.regularMarketPrice)) throw new Error('yahoo: no price');
  const prev = isFinite(m.chartPreviousClose) ? m.chartPreviousClose : m.regularMarketPrice;
  return { px: m.regularMarketPrice, chgPct: prev > 0 ? (m.regularMarketPrice - prev) / prev * 100 : 0, asof: new Date((m.regularMarketTime || Date.now() / 1000) * 1000).toISOString(), provider: 'yahoo', synthetic: false };
}

/* tf → yahoo interval/range + aggregation factor */
const TF_MAP = {
  '1m': ['1m', '1d', 1], '5m': ['5m', '5d', 1], '15m': ['15m', '5d', 1],
  '1H': ['60m', '1mo', 1], '4H': ['60m', '3mo', 4],
  '1D': ['1d', '1y', 1], '1W': ['1wk', '5y', 1], '1M': ['1mo', 'max', 1],
};

async function realCandles(sym, tf, n) {
  const [interval, range, agg] = TF_MAP[tf] || TF_MAP['5m'];
  const r = await yahooChart(sym, interval, range);
  const q = r.indicators.quote[0];
  let out = [];
  for (let i = 0; i < r.timestamp.length; i++) {
    if (q.open[i] == null || q.close[i] == null) continue;
    out.push({ t: r.timestamp[i], o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i], vol: q.volume[i] || 0 });
  }
  if (agg > 1) {
    const g = [];
    for (let i = 0; i < out.length; i += agg) {
      const w = out.slice(i, i + agg);
      g.push({ t: w[0].t, o: w[0].o, h: Math.max(...w.map(x => x.h)), l: Math.min(...w.map(x => x.l)), c: w[w.length - 1].c, vol: w.reduce((a, x) => a + x.vol, 0) });
    }
    out = g;
  }
  out = out.slice(-n);
  if (out.length < 20) throw new Error('yahoo: too few bars (' + out.length + ')');
  const maxV = Math.max(...out.map(x => x.vol), 1);
  return out.map(x => ({ o: x.o, h: x.h, l: x.l, c: x.c, v: 0.15 + (x.vol / maxV) * 2.2, rawV: x.vol, t: x.t }));
}

/* ── SIM fallback — honest synthetic continuation, labeled as such ── */
const simState = {}; // sym -> {px, chgPct}
function simQuote(sym, basePx) {
  if (!simState[sym]) {
    const r = rngFor('sim-' + sym);
    simState[sym] = { px: basePx > 0 ? basePx : 40 + r() * 400, chgPct: (r() - 0.5) * 3, r: rngFor('walk-' + sym + '-' + BOOT) };
  }
  const st = simState[sym];
  const d = (st.r() - 0.492) * 0.0012;
  st.px *= (1 + d); st.chgPct += d * 100;
  return { px: st.px, chgPct: st.chgPct, asof: new Date().toISOString(), provider: 'sim', synthetic: true };
}
function simCandles(sym, tf, n, basePx) {
  const r = rngFor('simc-' + sym + '-' + tf + '-' + n);
  const out = []; let px = (basePx > 0 ? basePx : 100) * 0.965;
  for (let i = 0; i < n; i++) {
    const o = px, mv = (r() - 0.485) * 0.008;
    const c = o * (1 + mv), h = Math.max(o, c) * (1 + r() * 0.003), l = Math.min(o, c) * (1 - r() * 0.003);
    out.push({ o, h, l, c, v: 0.3 + r() * 1.6, rawV: Math.round(1e5 * (0.3 + r() * 1.6)), t: 0 });
    px = c;
  }
  const anchor = (basePx > 0 ? basePx : 100) / px;
  out.forEach(cd => { cd.o *= anchor; cd.c *= anchor; cd.h *= anchor; cd.l *= anchor; });
  return out;
}

/* ── feed service: cache + provider health ── */
const providers = { stooq: { ok: null, lastErr: null, lastOkAt: 0 }, yahoo: { ok: null, lastErr: null, lastOkAt: 0 } };
const quoteCache = {};   // sym -> {q, at}
const candleCache = {};  // sym|tf|n -> {arr, at, provider, synthetic}
const QUOTE_TTL = 5000, CANDLE_TTL = 60000;

async function getQuote(sym, basePx) {
  const c = quoteCache[sym];
  if (c && Date.now() - c.at < QUOTE_TTL) return c.q;
  let q = null;
  try { q = await stooqQuote(sym); providers.stooq.ok = true; providers.stooq.lastOkAt = Date.now(); }
  catch (e1) {
    providers.stooq.ok = false; providers.stooq.lastErr = e1.message;
    try { q = await yahooQuote(sym); providers.yahoo.ok = true; providers.yahoo.lastOkAt = Date.now(); }
    catch (e2) { providers.yahoo.ok = false; providers.yahoo.lastErr = e2.message; }
  }
  if (!q) q = simQuote(sym, basePx);
  quoteCache[sym] = { q, at: Date.now() };
  return q;
}

async function getCandles(sym, tf, n, basePx) {
  const key = sym + '|' + tf + '|' + n;
  const c = candleCache[key];
  if (c && Date.now() - c.at < CANDLE_TTL) return c;
  let entry;
  try {
    const arr = await realCandles(sym, tf, n);
    providers.yahoo.ok = true; providers.yahoo.lastOkAt = Date.now();
    entry = { arr, at: Date.now(), provider: 'yahoo', synthetic: false, tf };
  } catch (e) {
    providers.yahoo.ok = providers.yahoo.ok === true ? providers.yahoo.ok : false;
    providers.yahoo.lastErr = e.message;
    entry = { arr: simCandles(sym, tf, n, basePx), at: Date.now(), provider: 'sim', synthetic: true, tf };
  }
  candleCache[key] = entry;
  return entry;
}

function feedMode() {
  const anyReal = Object.values(quoteCache).some(c => !c.q.synthetic) || Object.values(candleCache).some(c => !c.synthetic);
  return anyReal ? 'LIVE' : 'SIM';
}

/* ── server-side risk engine — the SAME laws, enforced where they belong ── */
function riskCheck(plan, state) {
  plan = plan || {}; state = state || {};
  const r = { verdict: 'PASS', codes: [], required: [], enforcedBy: VERSION };
  const deny = (code, msg, req) => { r.verdict = 'BLOCK'; r.codes.push({ code, msg }); if (req) r.required.push(req); };
  const warn = (code, msg) => r.codes.push({ code, msg, advisory: true });
  const equity = +state.equity > 0 ? +state.equity : 60000;
  if (state.kill) deny('RISK-KILL', 'Kill switch active — all order paths locked', 'Resume desk (owner) before any approval');
  if (state.riskMode === 'COOLDOWN' || state.riskMode === 'BLOCKED') deny('RISK-MODE', 'risk_mode=' + state.riskMode + ' — circuit breaker engaged (LAW-011)', 'Wait for session reset');
  const riskPct = (+plan.riskUSD || 0) / equity * 100;
  if (riskPct > CONFIG['risk.max_trade_risk_pct']) deny('RISK-SIZE', riskPct.toFixed(2) + '% > risk.max_trade_risk_pct ' + CONFIG['risk.max_trade_risk_pct'] + '%', 'Reduce size');
  if ((+state.openRiskR || 0) + (+plan.riskR || 0) > CONFIG['risk.max_open_risk_R']) deny('RISK-OPEN', 'Open risk would exceed ' + CONFIG['risk.max_open_risk_R'] + 'R cap', 'Close or reduce an open position first');
  if (+plan.rr < CONFIG['risk.min_rr']) deny('RISK-5R', 'Best realistic path ' + (+plan.rr).toFixed(2) + 'R < ' + CONFIG['risk.min_rr'] + 'R (LAW-004)', 'A wider target must be STRUCTURAL, not wished — otherwise reject');
  if (plan.spreadPct != null && plan.spreadPct > CONFIG['options.max_spread_pct']) deny('OPT-007', 'Contract spread ' + (+plan.spreadPct).toFixed(1) + '% > ' + CONFIG['options.max_spread_pct'] + '% (LAW-009)', 'Pick a liquid strike/expiry or WAIT');
  if (plan.eventHrs != null && plan.eventHrs < CONFIG['risk.event_window_hrs']) deny('RISK-EVENT', 'Binary event in ' + plan.eventHrs + 'h < ' + CONFIG['risk.event_window_hrs'] + 'h blackout (LAW-017)', 'Wait for the event to pass');
  if (plan.sectorPct != null && plan.sectorPct > CONFIG['risk.max_sector_exposure']) deny('RISK-SECTOR', 'Cluster exposure ' + (+plan.sectorPct).toFixed(1) + '% > ' + CONFIG['risk.max_sector_exposure'] + '% cap', 'Correlated risk counts as one position');
  if (state.dataHealth && state.dataHealth !== 'NOMINAL') deny('DATA-STALE', 'Data health ' + state.dataHealth + ' — stale inputs cannot approve (LAW-006)', 'Restore feed SLO first');
  if (plan.fresh === false) deny('DATA-SNAP', 'Evidence snapshot expired — packet must revalidate (LAW-006)', 'Re-run the desk on this symbol');
  if (plan.counterRegime) warn('CTX-REGIME', 'Counter-regime trade — size discipline advised, paper preferred');
  return r;
}

/* ── approval tokens — single-use, plan-hash bound, real TTL ── */
const tokens = {}; let tknSeq = 90000;
function issueToken(packetId, planHash, decision) {
  const id = 'STKN-' + (++tknSeq);
  tokens[id] = { id, packetId, planHash, decision, issuedAt: Date.now(), ttlSec: CONFIG['token.ttl_sec'], used: false };
  audit('SVR TokenIssuer', 'token', id + ' issued for ' + packetId + ' · ' + decision + ' · hash ' + planHash + ' · single-use · ttl ' + CONFIG['token.ttl_sec'] + 's');
  return tokens[id];
}
function redeemToken(id, planHash) {
  const t = tokens[id];
  if (!t) return { ok: false, code: 'TKN-404', msg: 'Token unknown' };
  if (t.used) return { ok: false, code: 'TKN-USED', msg: 'Token already redeemed — single-use' };
  if ((Date.now() - t.issuedAt) / 1000 > t.ttlSec) return { ok: false, code: 'TKN-EXP', msg: 'Token expired — plan returns to review' };
  if (t.planHash !== planHash) return { ok: false, code: 'TKN-HASH', msg: 'Plan changed since approval — token invalidated' };
  t.used = true;
  audit('SVR TokenIssuer', 'token', id + ' redeemed for ' + t.packetId);
  return { ok: true, token: t };
}

/* ── SSE stream ── */
const sseClients = new Set();
function sseSend(res, event, data) { res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'); }
setInterval(async () => {
  if (!sseClients.size) return;
  const bySyms = {};
  for (const c of sseClients) for (const [sym, base] of c.syms) bySyms[sym] = base;
  const out = {};
  await Promise.all(Object.entries(bySyms).map(async ([sym, base]) => { out[sym] = await getQuote(sym, base); }));
  const payload = { at: new Date().toISOString(), mode: feedMode(), quotes: out };
  for (const c of sseClients) { try { sseSend(c.res, 'quotes', payload); } catch { sseClients.delete(c); } }
}, 2500);
setInterval(() => {
  for (const c of sseClients) { try { sseSend(c.res, 'beat', health()); } catch { sseClients.delete(c); } }
}, 10000);

function health() {
  return {
    ok: true, service: 'atlas-live-spine', version: VERSION, mode: feedMode(),
    uptime_s: Math.round((Date.now() - BOOT) / 1000), time: new Date().toISOString(),
    providers: {
      stooq: { ok: providers.stooq.ok, lastErr: providers.stooq.lastErr },
      yahoo: { ok: providers.yahoo.ok, lastErr: providers.yahoo.lastErr },
    },
    ledger: { entries: seq, head: ledger.length ? ledger[ledger.length - 1].h : 'GENESIS' },
    stream_clients: sseClients.size,
    config: CONFIG,
    honesty: 'synthetic values are always stamped synthetic:true; SIM mode never claims live',
  };
}

/* ── HTTP plumbing ── */
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' });
  res.end(body);
}
async function readBody(req) {
  let b = ''; for await (const ch of req) { b += ch; if (b.length > 1e6) throw new Error('body too large'); }
  return b ? JSON.parse(b) : {};
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' });
    return res.end();
  }
  try {
    if (p === '/v1/health') return json(res, 200, health());

    if (p === '/v1/quotes') {
      // syms=NVDA:196.74,TSLA:242.1  (baseline px used only for SIM continuity)
      const pairs = (u.searchParams.get('syms') || '').split(',').filter(Boolean).slice(0, 64)
        .map(s => { const [sym, base] = s.split(':'); return [sym.toUpperCase(), +base || 0]; });
      const out = {};
      await Promise.all(pairs.map(async ([sym, base]) => { out[sym] = await getQuote(sym, base); }));
      return json(res, 200, { at: new Date().toISOString(), mode: feedMode(), quotes: out });
    }

    if (p === '/v1/candles') {
      const sym = (u.searchParams.get('sym') || 'NVDA').toUpperCase();
      const tf = u.searchParams.get('tf') || '5m';
      const n = Math.min(1000, Math.max(30, +u.searchParams.get('n') || 360));
      const base = +u.searchParams.get('px') || 0;
      const c = await getCandles(sym, tf, n, base);
      return json(res, 200, { sym, tf, n: c.arr.length, provider: c.provider, synthetic: c.synthetic, asof: new Date(c.at).toISOString(), candles: c.arr });
    }

    if (p === '/v1/risk/check' && req.method === 'POST') {
      const { plan, state } = await readBody(req);
      const verdict = riskCheck(plan, state);
      audit('SVR RiskEngine', 'risk', 'Server risk check: ' + verdict.verdict + (verdict.codes.length ? ' · ' + verdict.codes.map(c => c.code).join(',') : '') + ' · plan rr=' + (plan && plan.rr));
      return json(res, 200, verdict);
    }

    if (p === '/v1/token/issue' && req.method === 'POST') {
      const { packetId, planHash, decision } = await readBody(req);
      if (!packetId || !planHash || !decision) return json(res, 400, { ok: false, msg: 'packetId, planHash, decision required' });
      return json(res, 200, { ok: true, token: issueToken(packetId, planHash, decision) });
    }
    if (p === '/v1/token/redeem' && req.method === 'POST') {
      const { id, planHash } = await readBody(req);
      return json(res, 200, redeemToken(id, planHash));
    }

    if (p === '/v1/audit' && req.method === 'POST') {
      const { actor, kind, msg } = await readBody(req);
      if (!actor || !msg) return json(res, 400, { ok: false, msg: 'actor and msg required' });
      return json(res, 200, { ok: true, entry: audit(String(actor).slice(0, 60), String(kind || 'client').slice(0, 24), String(msg).slice(0, 500)) });
    }
    if (p === '/v1/audit') {
      const n = Math.min(500, +u.searchParams.get('n') || 50);
      return json(res, 200, { entries: ledger.slice(-n).reverse(), head: ledger.length ? ledger[ledger.length - 1].h : 'GENESIS', total: seq });
    }

    if (p === '/v1/stream') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-store', connection: 'keep-alive' });
      const syms = (u.searchParams.get('syms') || '').split(',').filter(Boolean).slice(0, 64)
        .map(s => { const [sym, base] = s.split(':'); return [sym.toUpperCase(), +base || 0]; });
      const client = { res, syms };
      sseClients.add(client);
      sseSend(res, 'hello', { ...health(), note: 'quotes every 2.5s · beat every 10s' });
      req.on('close', () => sseClients.delete(client));
      return;
    }

    return json(res, 404, { ok: false, msg: 'unknown endpoint', endpoints: ['/v1/health', '/v1/quotes', '/v1/candles', '/v1/risk/check', '/v1/token/issue', '/v1/token/redeem', '/v1/audit', '/v1/stream'] });
  } catch (e) {
    return json(res, 500, { ok: false, msg: e.message });
  }
});

server.listen(PORT, () => {
  audit('SYSTEM', 'boot', VERSION + ' listening on :' + PORT + ' — providers validate strictly; SIM fallback is always labeled');
  console.log(`[atlas] LIVE SPINE up on http://127.0.0.1:${PORT}  (health: /v1/health)`);
  console.log('[atlas] providers: stooq, yahoo — unreachable providers degrade to labeled SIM feed, never fiction');
});
