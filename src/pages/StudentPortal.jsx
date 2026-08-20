import { useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { useApp } from "../context/AppContext";
import CopyHash from "../components/CopyHash";
import { formatXLM, shortAddress, server } from "../utils/stellar";
import { CheckCircle2, Clock, ExternalLink, Loader2, Plus, AlertCircle, ArrowDownLeft } from "lucide-react";

/* ── Shared inline style tokens ─────────────────────────── */
const card   = { background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:12, padding:20 };
const label  = { fontSize:10, fontFamily:"monospace", color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4, display:"block" };
const mono   = { fontFamily:"monospace", fontSize:12, color:"var(--text-muted)", wordBreak:"break-all" };
const input  = { width:"100%", height:36, border:"1px solid var(--border-2)", background:"var(--input-bg)", borderRadius:8, padding:"0 12px", fontSize:13, fontFamily:"monospace", color:"var(--text)", outline:"none", boxSizing:"border-box" };
const select = { ...input, cursor:"pointer" };
const btnPrimary = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, height:36, padding:"0 16px", fontSize:13, fontWeight:600, background:"var(--text)", color:"var(--bg)", border:"none", borderRadius:8, cursor:"pointer" };
const btnOutline = { ...btnPrimary, background:"transparent", color:"var(--text)", border:"1px solid var(--border-2)" };
const tag    = { fontSize:10, fontFamily:"monospace", color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.1em" };

const FIELDS   = ["Computer Science","Engineering","Medicine","Design","Physics","Law","Arts","Commerce","Other"];
const DURATIONS = [7, 14, 30];

function timeLeft(exp) {
  const d = new Date(exp).getTime() - Date.now();
  if (d <= 0) return "Expired";
  const days = Math.floor(d/86400000), hrs = Math.floor((d%86400000)/3600000);
  if (days > 0) return `${days}d ${hrs}h left`;
  return `${hrs}h ${Math.floor((d%3600000)/60000)}m left`;
}
function timeAgo(s) {
  const d = Math.floor((Date.now()-new Date(s).getTime())/1000);
  if (d<60) return `${d}s ago`;
  if (d<3600) return `${Math.floor(d/60)}m ago`;
  if (d<86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

function Badge({ text, color="#888", bg="rgba(255,255,255,0.05)", border="rgba(255,255,255,0.1)" }) {
  return <span style={{ fontSize:11, fontFamily:"monospace", fontWeight:500, color, background:bg, border:`1px solid ${border}`, borderRadius:4, padding:"2px 7px", display:"inline-flex", alignItems:"center", gap:4 }}>{text}</span>;
}

function PostDialog({ open, onClose, onPosted }) {
  const { publicKey } = useWallet();
  const [f, setF] = useState({ purpose:"", field:"", location:"", description:"", goalXLM:"", durationDays:14 });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (parseFloat(f.goalXLM) < 1) { setErr("Goal must be at least 1 XLM."); return; }
    setLoading(true);
    try { await onPosted({ ...f, goalXLM: parseFloat(f.goalXLM) }); setDone(true); }
    catch { setErr("Failed to post. Please try again."); }
    setLoading(false);
  };
  const close = () => { setDone(false); setF({ purpose:"",field:"",location:"",description:"",goalXLM:"",durationDays:14 }); setErr(""); onClose(); };

  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }} onClick={e=>e.target===e.currentTarget&&close()}>
      <div style={{ width:"100%",maxWidth:480,background:"var(--surface)",border:"1px solid var(--card-border)",borderRadius:12,padding:24,boxShadow:"0 25px 50px rgba(0,0,0,0.5)",maxHeight:"90vh",overflowY:"auto" }}>
        <h2 style={{ fontSize:15,fontWeight:600,color:"var(--text)",marginBottom:4 }}>Post a Funding Request</h2>
        <p style={{ fontSize:13,color:"var(--text-muted)",marginBottom:20 }}>Describe what you need funding for. Donors will read this and decide to support you.</p>
        {done ? (
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:600,color:"#4ade80",marginBottom:12 }}><CheckCircle2 size={16}/>Request posted successfully</div>
            <p style={{ fontSize:13,color:"var(--text-muted)",marginBottom:16 }}>Your request is now live. Donors can browse and send XLM directly to your wallet.</p>
            <button style={btnPrimary} onClick={close}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ marginBottom:14 }}>
              <label style={label}>Purpose of funding</label>
              <input style={input} placeholder="e.g. Laptop for B.Tech final year project" value={f.purpose} onChange={e=>setF(p=>({...p,purpose:e.target.value}))} required />
              <span style={{ fontSize:11,color:"var(--text-dim)",marginTop:4,display:"block" }}>This becomes the title. Be specific.</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
              <div>
                <label style={label}>Field of Study</label>
                <select style={select} value={f.field} onChange={e=>setF(p=>({...p,field:e.target.value}))} required>
                  <option value="">Select</option>
                  {FIELDS.map(x=><option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Location</label>
                <input style={input} placeholder="City, State" value={f.location} onChange={e=>setF(p=>({...p,location:e.target.value}))} required />
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={label}>Your story</label>
              <input style={input} placeholder="Why do you need this? What will it help you achieve?" maxLength={300} value={f.description} onChange={e=>setF(p=>({...p,description:e.target.value}))} required />
              <span style={{ fontSize:11,color:"var(--text-dim)",marginTop:4,display:"block" }}>{f.description.length}/300</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
              <div>
                <label style={label}>Goal (XLM)</label>
                <input style={input} type="number" min="1" placeholder="e.g. 500" value={f.goalXLM} onChange={e=>setF(p=>({...p,goalXLM:e.target.value}))} required />
              </div>
              <div>
                <label style={label}>Duration</label>
                <div style={{ display:"flex",gap:6 }}>
                  {DURATIONS.map(d=>(
                    <button key={d} type="button" onClick={()=>setF(p=>({...p,durationDays:d}))}
                      style={{ flex:1,height:36,fontSize:12,fontFamily:"monospace",borderRadius:8,cursor:"pointer",border:`1px solid ${f.durationDays===d?"var(--yellow-border)":"var(--border-2)"}`,background:f.durationDays===d?"var(--yellow-bg)":"transparent",color:f.durationDays===d?"var(--yellow)":"var(--text-dim)" }}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",marginBottom:14 }}>
              <span style={label}>Receiving Wallet</span>
              <div style={{ ...mono,fontSize:11 }}>{publicKey}</div>
              <span style={{ fontSize:11,color:"var(--text-dim)",marginTop:4,display:"block" }}>Donors send XLM directly to this address.</span>
            </div>
            {err && <div style={{ fontSize:12,color:"#f87171",marginBottom:12 }}>{err}</div>}
            <div style={{ display:"flex",gap:10 }}>
              <button type="button" style={{ ...btnOutline,flex:1 }} onClick={close}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary,flex:1,opacity:loading?0.6:1 }} disabled={loading}>
                {loading?<><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} />Posting</>:"Post Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function useReceivedPayments(publicKey) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(true);
  useEffect(() => {
    ref.current = true;
    const fetch = async () => {
      if (!publicKey) return;
      try {
        const r = await server.payments().forAccount(publicKey).limit(20).order("desc").call();
        if (!ref.current) return;
        setPayments(r.records.filter(p=>p.type==="payment"&&p.asset_type==="native"&&p.to===publicKey)
          .map(p=>({ id:p.id,from:p.from,amount:parseFloat(p.amount).toFixed(2),time:p.created_at,hash:p.transaction_hash })));
      } catch {}
      finally { if (ref.current) setLoading(false); }
    };
    fetch();
    const iv = setInterval(fetch, 10000);
    return () => { ref.current=false; clearInterval(iv); };
  }, [publicKey]);
  return { payments, loading };
}

function RequestCard({ req }) {
  const pct = Math.min(100, Math.round((req.raised/req.goalXLM)*100));
  const expired = new Date(req.expiresAt) < new Date();
  const tl = timeLeft(req.expiresAt);
  return (
    <div style={{ ...card,opacity:expired?0.5:1,marginBottom:12 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap" }}>
        <Badge text={req.field} />
        {expired
          ? <Badge text="Expired" color="#f87171" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.2)" />
          : <Badge text={tl} color="#fbbf24" bg="rgba(251,191,36,0.1)" border="rgba(251,191,36,0.2)" />
        }
        {req.raised>=req.goalXLM&&!expired&&<Badge text="Funded" color="#4ade80" bg="rgba(74,222,128,0.1)" border="rgba(74,222,128,0.2)" />}
        <Badge text="Your request" color="var(--yellow)" bg="var(--yellow-bg)" border="var(--yellow-border)" />
      </div>
      <h3 style={{ fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:6 }}>{req.purpose}</h3>
      <p style={{ fontSize:12,color:"var(--text-muted)",lineHeight:1.6,marginBottom:12 }}>{req.description}</p>
      <div style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginBottom:12 }}>{req.location} · {shortAddress(req.studentWallet)}</div>
      <div style={{ background:"var(--surface-2)",borderRadius:4,height:4,overflow:"hidden",marginBottom:6 }}>
        <div style={{ height:"100%",width:`${pct}%`,background:"var(--yellow)",borderRadius:4,transition:"width 0.3s" }} />
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>
        <span>{req.raised} XLM raised</span><span>{pct}% of {req.goalXLM} XLM</span>
      </div>
      {req.donorCount>0&&<div style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginTop:6 }}>{req.donorCount} donor{req.donorCount!==1?"s":""}</div>}
    </div>
  );
}

export default function StudentPortal() {
  const { publicKey, balance } = useWallet();
  const { getRequestsByWallet, postRequest } = useApp();
  const [tab, setTab] = useState("requests");
  const [showPost, setShowPost] = useState(false);
  const { payments, loading:pmtLoading } = useReceivedPayments(publicKey);
  const myReqs = getRequestsByWallet(publicKey);
  const totalRec = payments.reduce((s,p)=>s+parseFloat(p.amount),0);
  const active = myReqs.filter(r=>new Date(r.expiresAt)>=new Date());
  const expired = myReqs.filter(r=>new Date(r.expiresAt)<new Date());

  const tabs = [
    { id:"requests", label:`My Requests (${myReqs.length})` },
    { id:"received", label:`Received${payments.length>0?` (${payments.length})`:""}` },
  ];

  return (
    <div style={{ maxWidth:896,margin:"0 auto",padding:"32px 24px" }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:32 }}>
        <div>
          <div style={tag}>SCHOLARCHAIN / STUDENT</div>
          <h1 style={{ fontSize:20,fontWeight:600,color:"var(--text)",letterSpacing:"-0.02em",marginTop:4 }}>Student Dashboard</h1>
        </div>
        <button style={{ ...btnPrimary,gap:6,fontSize:12 }} onClick={()=>setShowPost(true)}>
          <Plus size={14}/>Post Request
        </button>
      </div>

      {/* Wallet strip */}
      <div style={{ ...card,display:"flex",flexWrap:"wrap",gap:24,marginBottom:24 }}>
        <div><span style={label}>Wallet</span><div style={mono}>{shortAddress(publicKey)}</div></div>
        <div style={{ width:1,background:"var(--border)" }} />
        <div><span style={label}>Balance</span><div style={{ fontSize:14,fontWeight:600,color:"var(--text)",fontFamily:"monospace" }}>{formatXLM(balance)} XLM</div></div>
        {totalRec>0&&<><div style={{ width:1,background:"var(--border)" }} /><div><span style={label}>Total Received</span><div style={{ fontSize:14,fontWeight:600,color:"#4ade80",fontFamily:"monospace" }}>{totalRec.toFixed(2)} XLM</div></div></>}
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

      {/* My Requests */}
      {tab==="requests"&&(
        <div>
          {myReqs.length===0?(
            <div style={{ textAlign:"center",padding:"64px 24px",border:"1px dashed var(--border)",borderRadius:12 }}>
              <div style={{ fontSize:13,fontFamily:"monospace",color:"var(--text-dim)",marginBottom:16 }}>No requests posted yet</div>
              <button style={{ ...btnPrimary,fontSize:12,gap:6 }} onClick={()=>setShowPost(true)}><Plus size={14}/>Post your first request</button>
            </div>
          ):(
            <>
              {active.map(r=><RequestCard key={r.id} req={r}/>)}
              {expired.length>0&&(
                <div style={{ marginTop:24 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12 }}>
                    <AlertCircle size={12}/>Expired requests
                  </div>
                  {expired.map(r=><RequestCard key={r.id} req={r}/>)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Received Payments */}
      {tab==="received"&&(
        <div>
          {pmtLoading?(
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"64px 0",fontSize:13,fontFamily:"monospace",color:"var(--text-dim)" }}>
              <Loader2 size={16} style={{ animation:"spin 1s linear infinite" }}/>Fetching on-chain payments...
            </div>
          ):payments.length===0?(
            <div style={{ textAlign:"center",padding:"64px 0",fontSize:13,fontFamily:"monospace",color:"var(--text-dim)" }}>No incoming payments found for this wallet yet.</div>
          ):(
            <>
              <div style={{ background:"var(--yellow-bg)",border:"1px solid var(--yellow-border)",borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                <span style={{ fontSize:13,color:"var(--text-muted)" }}>Total received on-chain</span>
                <span style={{ fontSize:18,fontWeight:600,fontFamily:"monospace",color:"var(--yellow)" }}>{totalRec.toFixed(2)} XLM</span>
              </div>
              {payments.map(p=>(
                <div key={p.id} style={{ ...card,marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:32,height:32,borderRadius:"50%",background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <ArrowDownLeft size={16} style={{ color:"#4ade80" }}/>
                      </div>
                      <div>
                        <div style={{ fontSize:14,fontWeight:600,color:"var(--text)" }}>+{p.amount} XLM</div>
                        <div style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginTop:2 }}>{timeAgo(p.time)}</div>
                      </div>
                    </div>
                    <Badge text="Confirmed" color="#4ade80" bg="rgba(74,222,128,0.1)" border="rgba(74,222,128,0.2)" />
                  </div>
                  <CopyHash hash={p.hash} label="Transaction Hash" />
                  <div style={{ background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",marginTop:10 }}>
                    <span style={label}>From</span>
                    <div style={mono}>{p.from}</div>
                  </div>
                  <a href={`https://stellar.expert/explorer/testnet/tx/${p.hash}`} target="_blank" rel="noreferrer"
                    style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontFamily:"monospace",color:"var(--text-dim)",marginTop:10,textDecoration:"none" }}>
                    View on Stellar Explorer <ExternalLink size={11}/>
                  </a>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <PostDialog open={showPost} onClose={()=>setShowPost(false)}
        onPosted={async(data)=>{ await postRequest(publicKey, data); setTab("requests"); }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
