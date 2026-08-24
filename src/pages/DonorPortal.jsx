import { useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { useApp } from "../context/AppContext";
import CopyHash from "../components/CopyHash";
import { sendXLMTransaction, submitSignedTransaction, getExplorerUrl, formatXLM, shortAddress } from "../utils/stellar";
import { signWithFreighter } from "../utils/freighter";
import { SC_MEMO } from "../context/AppContext";
import { CheckCircle2, Clock, ExternalLink, Loader2, Search, ArrowUpRight } from "lucide-react";
import { toast } from "../components/Toast";

const card     = { background:"var(--card-bg)",border:"1px solid var(--card-border)",borderRadius:12,padding:20 };
const label    = { fontSize:10,fontFamily:"monospace",color:"var(--text-dim)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,display:"block" };
const mono     = { fontFamily:"monospace",fontSize:12,color:"var(--text-muted)",wordBreak:"break-all" };
const input    = { width:"100%",height:36,border:"1px solid var(--border-2)",background:"var(--input-bg)",borderRadius:8,padding:"0 12px",fontSize:13,fontFamily:"monospace",color:"var(--text)",outline:"none",boxSizing:"border-box" };
const btnPrimary  = { display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,height:36,padding:"0 16px",fontSize:13,fontWeight:600,background:"var(--text)",color:"var(--bg)",border:"none",borderRadius:8,cursor:"pointer" };
const btnOutline  = { ...btnPrimary,background:"transparent",color:"var(--text)",border:"1px solid var(--border-2)" };
const tag      = { fontSize:10,fontFamily:"monospace",color:"var(--text-dim)",textTransform:"uppercase",letterSpacing:"0.1em" };

const SORTS  = [{ v:"newest",l:"Newest"},{ v:"urgent",l:"Most Urgent"},{ v:"least-funded",l:"Least Funded"},{ v:"most-funded",l:"Most Funded"}];
const FIELDS = ["All","Computer Science","Engineering","Medicine","Design","Physics","Law","Arts","Commerce","Other"];

function timeLeft(exp) {
  const d = new Date(exp).getTime()-Date.now();
  if (d<=0) return "Expired";
  const days=Math.floor(d/86400000),hrs=Math.floor((d%86400000)/3600000);
  if (days>0) return `${days}d ${hrs}h`;
  return `${hrs}h ${Math.floor((d%3600000)/60000)}m`;
}
function timeAgo(s) {
  const d=Math.floor((Date.now()-new Date(s).getTime())/1000);
  if (d<60) return `${d}s ago`;
  if (d<3600) return `${Math.floor(d/60)}m ago`;
  if (d<86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}
function Badge({ text, color="#888", bg="rgba(255,255,255,0.05)", border="rgba(255,255,255,0.1)" }) {
  return <span style={{ fontSize:11,fontFamily:"monospace",fontWeight:500,color,background:bg,border:`1px solid ${border}`,borderRadius:4,padding:"2px 7px",display:"inline-flex",alignItems:"center",gap:4 }}>{text}</span>;
}

function FundDialog({ request, onClose }) {
  const { publicKey, refreshBalance } = useWallet();
  const { recordFunding } = useApp();
  const [amount, setAmount] = useState("");
  const [state, setState] = useState("idle");
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState("");
  const goalXLM = parseFloat(request?.goalXLM) || 0;
  const raised   = parseFloat(request?.raised)   || 0;
  const remaining = Math.max(0, goalXLM - raised);
  const quickAmounts = [10,25,50,100].filter(q=>q<=remaining);

  const fund = async () => {
    setError("");
    const num = parseFloat(amount);
    if (!num||num<1) { setError("Minimum amount is 1 XLM."); return; }
    if (num>remaining) { setError(`Maximum you can send is ${remaining.toFixed(2)} XLM.`); return; }
    setState("building");
    try {
      const { xdr } = await sendXLMTransaction(publicKey, request.studentWallet, amount, SC_MEMO);
      setState("signing");
      const signed = await signWithFreighter(xdr, publicKey);
      setState("submitting");
      const result = await submitSignedTransaction(signed);
      setTxHash(result.hash);
      await recordFunding(publicKey, request.id, num, result.hash);
      await refreshBalance();
      setState("success");
      toast.success(`${amount} XLM sent successfully`);
    } catch (err) {
      const msgs = { INSUFFICIENT_BALANCE:"Not enough XLM. Use Get Test XLM in the navbar.", USER_DECLINED_SIGN:"Cancelled in Freighter.", SIGN_FAILED:"Signing failed. Ensure Freighter is set to Testnet.", TX_SUBMIT_FAILED:"Transaction failed. Please try again." };
      const errMsg = msgs[err.message]||"Something went wrong. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
      setState("error");
    }
  };

  const isProc = ["building","signing","submitting"].includes(state);
  const stepLabel = { building:"Building transaction...", signing:"Waiting for Freighter...", submitting:"Broadcasting to Stellar..." }[state];

  const close = () => { if (isProc) return; setState("idle"); setAmount(""); setError(""); setTxHash(null); onClose(); };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }} onClick={e=>e.target===e.currentTarget&&close()}>
      <div style={{ width:"100%",maxWidth:440,background:"var(--surface)",border:"1px solid var(--card-border)",borderRadius:12,padding:24,boxShadow:"0 25px 50px rgba(0,0,0,0.5)" }}>
        <h2 style={{ fontSize:15,fontWeight:600,color:"var(--text)",marginBottom:2 }}>Fund this request</h2>
        <p style={{ fontSize:13,color:"var(--text-muted)",marginBottom:20 }}>{request?.purpose}</p>

        {state==="success"?(
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:600,color:"#4ade80",marginBottom:16 }}><CheckCircle2 size={16}/>{amount} XLM sent successfully</div>
            <CopyHash hash={txHash} label="Transaction Hash" />
            <div style={{ background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",marginTop:10 }}>
              <div style={{ marginBottom:8 }}><span style={label}>Sent To</span><div style={mono}>{request?.studentWallet}</div></div>
              <div style={{ marginBottom:8 }}><span style={label}>Amount</span><div style={{ fontSize:14,fontWeight:600,fontFamily:"monospace",color:"var(--text)" }}>{amount} XLM</div></div>
              <div><span style={label}>Memo</span><div style={{ fontSize:12,fontFamily:"monospace",color:"var(--yellow)" }}>{SC_MEMO}</div></div>
            </div>
            <a href={getExplorerUrl(txHash)} target="_blank" rel="noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginTop:10,textDecoration:"none" }}>View on Stellar Explorer <ExternalLink size={11}/></a>
            <button style={{ ...btnPrimary,width:"100%",marginTop:16 }} onClick={close}>Done</button>
          </div>
        ):(
          <div>
            {/* Progress */}
            <div style={{ background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginBottom:8 }}>
                <span>Raised so far</span><span style={{ color:"var(--text)" }}>{request?.raised} / {request?.goalXLM} XLM</span>
              </div>
              <div style={{ background:"var(--surface-2)",borderRadius:4,height:4,overflow:"hidden",marginBottom:6 }}>
                <div style={{ height:"100%",width:`${Math.min(100,Math.round((request?.raised/request?.goalXLM)*100))}%`,background:"var(--yellow)" }} />
              </div>
              <div style={{ fontSize:11,fontFamily:"monospace",color:"var(--yellow)" }}>{remaining.toFixed(2)} XLM still needed</div>
            </div>
            {/* Recipient */}
            <div style={{ background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",marginBottom:14 }}>
              <span style={label}>Sending to</span>
              <div style={mono}>{request?.studentWallet}</div>
            </div>
            {/* Amount */}
            <div style={{ marginBottom:14 }}>
              <span style={{ ...label,marginBottom:8 }}>Amount (XLM) — max {remaining.toFixed(2)} XLM</span>
              {quickAmounts.length>0&&(
                <div style={{ display:"flex",gap:6,marginBottom:8 }}>
                  {quickAmounts.map(q=>(
                    <button key={q} onClick={()=>setAmount(String(q))}
                      style={{ flex:1,height:32,fontSize:12,fontFamily:"monospace",borderRadius:8,cursor:"pointer",border:`1px solid ${amount===String(q)?"var(--yellow-border)":"var(--border-2)"}`,background:amount===String(q)?"var(--yellow-bg)":"transparent",color:amount===String(q)?"var(--yellow)":"var(--text-dim)" }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <input style={input} type="number" min="1" max={remaining} placeholder={`Max ${remaining.toFixed(2)} XLM`}
                value={amount} onChange={e=>{ setAmount(e.target.value); setError(""); }} disabled={isProc} />
              {amount&&parseFloat(amount)>remaining&&(
                <div style={{ fontSize:12,color:"#f87171",marginTop:6 }}>Amount exceeds what is needed. Max: {remaining.toFixed(2)} XLM.</div>
              )}
            </div>
            {error&&<div style={{ fontSize:12,color:"#f87171",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:14 }}>{error}</div>}
            {isProc&&<div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,fontFamily:"monospace",color:"var(--text-dim)",marginBottom:14 }}><Loader2 size={12} style={{ animation:"spin 1s linear infinite" }}/>{stepLabel}</div>}
            <div style={{ display:"flex",gap:10 }}>
              <button style={{ ...btnOutline,flex:1 }} onClick={close} disabled={isProc}>Cancel</button>
              <button style={{ ...btnPrimary,flex:1,opacity:isProc||!amount||parseFloat(amount)<1||(remaining>0&&parseFloat(amount)>remaining)?0.5:1 }}
                onClick={fund} disabled={isProc||!amount||parseFloat(amount)<1||(remaining>0&&parseFloat(amount)>remaining)}>
                {isProc?stepLabel:`Send ${amount||"—"} XLM`}
              </button>
            </div>
            <div style={{ textAlign:"center",fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginTop:12 }}>Memo: {SC_MEMO} · Stellar Testnet</div>
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ req, onFund, isVerified }) {
  const pct = Math.min(100,Math.round((req.raised/req.goalXLM)*100));
  const tl = timeLeft(req.expiresAt);
  const expired = tl==="Expired";
  const full = pct>=100;
  return (
    <div style={{ ...card,display:"flex",flexDirection:"column",gap:14,opacity:expired?0.4:1 }}>
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10,flexWrap:"wrap" }}>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            <Badge text={req.field} />
            {!expired&&<Badge text={tl} color="#fbbf24" bg="rgba(251,191,36,0.1)" border="rgba(251,191,36,0.2)" />}
            {expired&&<Badge text="Expired" color="#f87171" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.2)" />}
            {isVerified&&<Badge text="Previously funded" color="#4ade80" bg="rgba(74,222,128,0.1)" border="rgba(74,222,128,0.2)" />}
          </div>
          <span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",flexShrink:0 }}>{req.donorCount} donor{req.donorCount!==1?"s":""}</span>
        </div>
        <h3 style={{ fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:6,lineHeight:1.3 }}>{req.purpose}</h3>
        <p style={{ fontSize:12,color:"var(--text-muted)",lineHeight:1.6 }}>{req.description}</p>
      </div>
      <div style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>{req.location} · {shortAddress(req.studentWallet)}</div>
      <div>
        <div style={{ background:"var(--surface-2)",borderRadius:4,height:4,overflow:"hidden",marginBottom:6 }}>
          <div style={{ height:"100%",width:`${pct}%`,background:"var(--yellow)",borderRadius:4,transition:"width 0.3s" }} />
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>
          <span>{req.raised} XLM raised</span><span>{pct}% of {req.goalXLM} XLM</span>
        </div>
      </div>
      <button
        style={{ ...btnPrimary,width:"100%",gap:6,opacity:expired||full?0.4:1,background:expired||full?"var(--surface-2)":undefined,color:expired||full?"var(--text-muted)":undefined,border:expired||full?"1px solid var(--border-2)":undefined,cursor:expired||full?"not-allowed":"pointer" }}
        onClick={()=>!expired&&!full&&onFund(req)} disabled={expired||full}>
        {full?"Fully Funded":expired?"Expired":<><ArrowUpRight size={14}/>Fund this student</>}
      </button>
    </div>
  );
}

export default function DonorPortal() {
  const { publicKey, balance } = useWallet();
  const { activeRequests, getDonationsByWallet, checkPreviouslyFunded } = useApp();
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [fundReq, setFundReq] = useState(null);
  const [verified, setVerified] = useState({});

  const myDonations = getDonationsByWallet(publicKey);
  const totalDonated = myDonations.reduce((s,d)=>s+d.amount,0);

  useEffect(()=>{
    const wallets = [...new Set(activeRequests.map(r=>r.studentWallet))];
    wallets.forEach(async w=>{
      if (verified[w]!==undefined) return;
      const r = await checkPreviouslyFunded(w);
      setVerified(p=>({...p,[w]:r}));
    });
  }, [activeRequests]);

  let filtered = activeRequests.filter(r=>{
    const mf = fieldFilter==="All"||r.field===fieldFilter;
    const ms = !search||r.purpose.toLowerCase().includes(search.toLowerCase())||r.description.toLowerCase().includes(search.toLowerCase());
    return mf&&ms;
  });
  filtered = [...filtered].sort((a,b)=>{
    if (sort==="newest") return new Date(b.createdAt)-new Date(a.createdAt);
    if (sort==="urgent") return new Date(a.expiresAt)-new Date(b.expiresAt);
    if (sort==="least-funded") return (a.raised/a.goalXLM)-(b.raised/b.goalXLM);
    if (sort==="most-funded") return (b.raised/b.goalXLM)-(a.raised/a.goalXLM);
    return 0;
  });

  const tabs = [
    { id:"browse", label:`Browse (${activeRequests.length})` },
    { id:"history", label:`My Donations${myDonations.length>0?` (${myDonations.length})`:""}` },
  ];

  return (
    <div style={{ maxWidth:1024,margin:"0 auto",padding:"32px 24px" }}>
      <div style={{ marginBottom:32 }}>
        <div style={tag}>SCHOLARCHAIN / DONOR</div>
        <h1 style={{ fontSize:20,fontWeight:600,color:"var(--text)",letterSpacing:"-0.02em",marginTop:4 }}>Donor Dashboard</h1>
      </div>

      {/* Wallet strip */}
      <div style={{ ...card,display:"flex",flexWrap:"wrap",gap:24,marginBottom:24 }}>
        <div><span style={label}>Wallet</span><div style={mono}>{shortAddress(publicKey)}</div></div>
        <div style={{ width:1,background:"var(--border)" }}/>
        <div><span style={label}>Balance</span><div style={{ fontSize:14,fontWeight:600,fontFamily:"monospace",color:"var(--text)" }}>{formatXLM(balance)} XLM</div></div>
        {totalDonated>0&&<><div style={{ width:1,background:"var(--border)" }}/><div><span style={label}>Total Donated</span><div style={{ fontSize:14,fontWeight:600,fontFamily:"monospace",color:"var(--yellow)" }}>{totalDonated.toFixed(2)} XLM</div></div></>}
        <div style={{ width:1,background:"var(--border)" }}/>
        <div><span style={label}>Active Requests</span><div style={{ fontSize:14,fontWeight:600,fontFamily:"monospace",color:"var(--text)" }}>{activeRequests.length}</div></div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",borderBottom:"1px solid var(--border)",marginBottom:24 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:"10px 16px",fontSize:11,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.1em",background:"none",border:"none",cursor:"pointer",borderBottom:`2px solid ${tab===t.id?"var(--yellow)":"transparent"}`,color:tab===t.id?"var(--text)":"var(--text-dim)",marginBottom:-1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Browse */}
      {tab==="browse"&&(
        <>
          <div style={{ display:"flex",gap:12,marginBottom:16,flexWrap:"wrap" }}>
            <div style={{ position:"relative",flex:1,minWidth:200 }}>
              <Search size={14} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--text-dim)" }}/>
              <input style={{ ...input,paddingLeft:32 }} placeholder="Search requests..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <select style={{ ...input,width:"auto",minWidth:140,cursor:"pointer" }} value={sort} onChange={e=>setSort(e.target.value)}>
              {SORTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>

          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:20 }}>
            {FIELDS.map(f=>(
              <button key={f} onClick={()=>setFieldFilter(f)}
                style={{ padding:"6px 12px",fontSize:11,fontFamily:"monospace",borderRadius:8,cursor:"pointer",border:`1px solid ${fieldFilter===f?"var(--yellow-border)":"var(--border)"}`,background:fieldFilter===f?"var(--yellow-bg)":"transparent",color:fieldFilter===f?"var(--yellow)":"var(--text-dim)" }}>
                {f}
              </button>
            ))}
          </div>

          {filtered.length===0?(
            <div style={{ textAlign:"center",padding:"64px 24px",border:"1px dashed var(--border)",borderRadius:12,fontSize:13,fontFamily:"monospace",color:"var(--text-dim)" }}>
              {activeRequests.length===0?"No funding requests yet.":"No requests match your filters."}
            </div>
          ):(
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16 }}>
              {filtered.map(r=><RequestCard key={r.id} req={r} onFund={setFundReq} isVerified={verified[r.studentWallet]} />)}
            </div>
          )}
        </>
      )}

      {/* Donation History */}
      {tab==="history"&&(
        <div>
          {myDonations.length===0?(
            <div style={{ textAlign:"center",padding:"64px 0",fontSize:13,fontFamily:"monospace",color:"var(--text-dim)" }}>No donations made yet.</div>
          ):(
            myDonations.map(d=>{
              const req = activeRequests.find(r=>r.id===d.requestId);
              return (
                <div key={d.id} style={{ ...card,marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:2 }}>{req?.purpose||"Request no longer active"}</div>
                      <div style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>{timeAgo(d.time)}</div>
                    </div>
                    <div style={{ fontSize:14,fontWeight:600,fontFamily:"monospace",color:"var(--yellow)",flexShrink:0 }}>{d.amount} XLM</div>
                  </div>
                  <CopyHash hash={d.txHash} label="Transaction Hash" />
                  <a href={getExplorerUrl(d.txHash)} target="_blank" rel="noreferrer"
                    style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginTop:10,textDecoration:"none" }}>
                    View on Stellar Explorer <ExternalLink size={11}/>
                  </a>
                </div>
              );
            })
          )}
        </div>
      )}

      {fundReq&&<FundDialog request={fundReq} onClose={()=>setFundReq(null)} />}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
