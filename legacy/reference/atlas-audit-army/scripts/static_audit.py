#!/usr/bin/env python3
"""ATLAS Expert-Army static auditor — deterministic checks that need no browser.
Usage: python static_audit.py <path-to-app.html> [out.csv]
Checks: dead controls, R-math tie-out (LAW-004/015), duplicate DOM ids,
decision-enum canon, unbounded-stream caps, data-truth markers."""
import re, sys, csv

CANON_STATES={"APPROVED_PAPER","APPROVED_LIVE_HUMAN_CONFIRMATION_REQUIRED","APPROVED_REDUCED_SIZE",
"WAIT_FOR_CONFIRMATION","WATCH_ONLY","PAPER_ONLY","REJECTED","NO_TRADE","EXIT_REQUIRED",
"TAKE_PARTIALS","TRAIL_RUNNER","KILL_SWITCH_ACTIVE"}

def audit(path):
    h=open(path,encoding='utf-8',errors='replace').read()
    F=[]
    called=set(re.findall(r'onclick="\s*([A-Za-z_$][\w$]*)\s*\(', h))
    defined=set(re.findall(r'function\s+([A-Za-z_$][\w$]*)', h))
    defined|=set(re.findall(r'window\.([A-Za-z_$][\w$]*)\s*=', h))
    defined|=set(re.findall(r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()', h))
    dead=sorted(called-defined)
    for fn in dead:
        n=h.count('onclick="'+fn); F.append(("S1","Frontend Architect","dead-control",
          f"onclick handler '{fn}' is never defined ({n} button site(s) do nothing)",f'grep onclick="{fn}('))
    for m in re.finditer(r"rmath:\{entry:([\d.]+)\s*,\s*stop:([\d.]+)\s*,.*?t1:([\d.]+)\s*,\s*t2:([\d.]+)\s*,\s*t3:([\d.]+)\s*,\s*r1:([\d.]+)\s*,\s*r2:([\d.]+)\s*,\s*r3:([\d.]+)", h):
        e,s,t1,t2,t3,r1,r2,r3=map(float,m.groups()); risk=abs(e-s); d=1 if s<e else -1
        for t,r,lab in ((t1,r1,"T1"),(t2,r2,"T2"),(t3,r3,"T3")):
            calc=d*(t-e)/risk
            if abs(calc-r)>0.06:
                F.append(("S1","Risk Officer","rmath-tieout",
                  f"entry {e}/stop {s}: stored {lab}={r} but levels derive {calc:.2f}R",f"offset {m.start()}"))
    from collections import Counter
    body=h[h.find('<body'):]
    ids=Counter(re.findall(r'id="([A-Za-z][\w-]*)"', body.split('<script')[0]))
    for i,c in ids.items():
        if c>1: F.append(("S2","Runtime Engineer","dup-id",f'static id="{i}" appears {c}x (querySelector ambiguity)',"static shell"))
    used=set(re.findall(r"'(APPROVED_[A-Z_]+|WAIT_FOR_CONFIRMATION|WATCH_ONLY|PAPER_ONLY|REJECTED|NO_TRADE|EXIT_REQUIRED|TAKE_PARTIALS|TRAIL_RUNNER|KILL_SWITCH_ACTIVE)'", h))
    rogue=sorted(x for x in used if x not in CANON_STATES)
    for x in rogue: F.append(("S2","Compliance Auditor","enum-drift",f"non-canonical decision state '{x}' in UI (LAW-014)","grep"))
    for arr in ("AUTO.blotter","AUTO.stream","ALERTS","LEDGER","FLOW"):
        if arr+".unshift" in h or arr+".push" in h:
            capped=bool(re.search(re.escape(arr)+r"\.length\s*[>=]", h) or re.search(re.escape(arr)+r"\.length\s*=", h) or (arr+".shift" in h) or (arr+".pop" in h))
            if not capped: F.append(("S2","SRE/Perf","unbounded-stream",f"{arr} grows without a cap (memory over a session)",f"grep {arr}"))
    mr=len(re.findall(r"Math\.random", h))
    seeded=("Math.random=function" in h) or ("Math.random = function" in h)
    if mr and not seeded: F.append(("S1","Data-Truth Engineer","determinism",f"{mr} Math.random sites with no seeded override — replays diverge","grep Math.random"))
    for c in [w for w in ("guaranteed","10x monthly","always profitable","risk-free") if w.lower() in h.lower()]:
        F.append(("S1","Compliance Auditor","claims-language",f"forbidden performance claim text: '{c}'","grep"))
    return F, {"onclick_fns":len(called),"dead":len(dead),"rmath_objs":len(re.findall(r'rmath:\{entry:',h)),"mr":mr,"seeded":seeded}

if __name__=="__main__":
    path=sys.argv[1]; out=sys.argv[2] if len(sys.argv)>2 else "findings.csv"
    F,meta=audit(path)
    with open(out,"w",newline="") as f:
        w=csv.writer(f); w.writerow(["id","severity","persona","check","finding","evidence","status"])
        for i,(sev,per,chk,fin,ev) in enumerate(F,1): w.writerow([f"F-{i:04d}",sev,per,chk,fin,ev,"OPEN"])
    from collections import Counter
    sev=Counter(x[0] for x in F)
    print(f"AUDITED {path}")
    print(f"  coverage: {meta['onclick_fns']} distinct onclick fns · {meta['rmath_objs']} rmath objects · MR sites {meta['mr']} (seeded={meta['seeded']})")
    print(f"  findings: {len(F)} -> " + (", ".join(f"{k}:{v}" for k,v in sorted(sev.items())) or "CLEAN"))
    for sevr,per,chk,fin,ev in F[:12]: print(f"   [{sevr}] {chk:16} {fin[:100]}")
