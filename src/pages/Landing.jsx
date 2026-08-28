import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import ActivityStrip from "../components/ActivityStrip";
import { Loader2, ArrowRight, BookOpen, Wallet, Sun, Moon } from "lucide-react";

const S = {
  page: { minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--bg)", color:"var(--text)" },
  nav: { borderBottom:"1px solid var(--border)", background:"var(--nav-bg)", backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:50 },
  navInner: { maxWidth:1080, margin:"0 auto", padding:"0 24px", height:52, display:"flex", alignItems:"center", gap:12 },
  brand: { fontSize:15, fontWeight:700, letterSpacing:"-0.03em", color:"var(--text)", background:"none", border:"none", cursor:"pointer", fontFamily:"Inter,sans-serif" },
  badge: { fontSize:9, fontFamily:"monospace", fontWeight:600, background:"var(--yellow-bg)", color:"var(--yellow)", border:"1px solid var(--yellow-border)", padding:"2px 7px", borderRadius:99, textTransform:"uppercase", letterSpacing:"0.1em" },
  navRight: { marginLeft:"auto", display:"flex", alignItems:"center", gap:20 },
  navLink: { fontSize:12, color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", letterSpacing:"0.01em" },
  themeBtn: { background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex", alignItems:"center", padding:4 },
  hero: { maxWidth:1080, margin:"0 auto", padding:"100px 24px 80px", width:"100%" },
  heroInner: { maxWidth:600 },
  tag: { fontSize:10, fontFamily:"monospace", color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:28, display:"block" },
  h1: { fontSize:"clamp(36px,5vw,52px)", fontWeight:700, letterSpacing:"-0.035em", lineHeight:1.08, marginBottom:22, color:"var(--text)" },
  yellow: { color:"var(--yellow)" },
  sub: { fontSize:15, color:"var(--text-muted)", lineHeight:1.75, marginBottom:44, maxWidth:460 },
  btnRow: { display:"flex", gap:12, flexWrap:"wrap" },
  btnPrimary: { display:"flex", alignItems:"center", gap:10, height:46, padding:"0 28px", fontSize:14, fontWeight:600, borderRadius:10, background:"var(--text)", color:"var(--bg)", border:"none", cursor:"pointer", letterSpacing:"-0.01em" },
  btnSecondary: { display:"flex", alignItems:"center", gap:10, height:46, padding:"0 28px", fontSize:14, fontWeight:600, borderRadius:10, background:"transparent", color:"var(--text)", border:"1px solid var(--border-2)", cursor:"pointer" },
  statsBar: { borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", background:"var(--surface)" },
  statsInner: { maxWidth:1080, margin:"0 auto", padding:"0 24px", display:"grid", gridTemplateColumns:"repeat(3,1fr)" },
  statItem: { padding:"20px 0" },
  statLabel: { fontSize:10, fontFamily:"monospace", color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 },
  statValue: { fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.02em" },
  howSection: { maxWidth:1080, margin:"0 auto", padding:"80px 24px" },
  howTag: { fontSize:10, fontFamily:"monospace", color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:14 },
  howTitle: { fontSize:"clamp(22px,3vw,28px)", fontWeight:700, letterSpacing:"-0.03em", color:"var(--text)", marginBottom:48 },
  cardsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 },
  card: { background:"var(--card-bg)", border:"1px solid var(--card-border)", borderRadius:14, padding:28 },
  cardTag: { fontSize:10, fontFamily:"monospace", color:"var(--yellow)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:24 },
  stepRow: { display:"flex", gap:18, marginBottom:22 },
  stepNum: { fontSize:11, fontFamily:"monospace", color:"var(--text-dim)", width:22, flexShrink:0, paddingTop:2 },
  stepTitle: { fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:5, letterSpacing:"-0.01em" },
  stepDesc: { fontSize:13, color:"var(--text-muted)", lineHeight:1.65 },
  cardBtn: { marginTop:24, width:"100%", height:38, fontSize:12, fontFamily:"monospace", color:"var(--text-muted)", background:"transparent", border:"1px solid var(--border-2)", borderRadius:8, cursor:"pointer", letterSpacing:"0.02em" },
  footer: { borderTop:"1px solid var(--border)", background:"var(--footer-bg)", padding:"22px 24px" },
  footerInner: { maxWidth:1080, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
  footerLink: { fontSize:12, fontFamily:"monospace", color:"var(--text-dim)", textDecoration:"none" },
  overlay: { position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 },
  modal: { width:"100%", maxWidth:390, background:"var(--surface)", border:"1px solid var(--card-border)", borderRadius:14, padding:28, boxShadow:"0 32px 64px rgba(0,0,0,0.6)" },
  modalTag: { fontSize:10, fontFamily:"monospace", color:"var(--yellow)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 },
  modalTitle: { fontSize:16, fontWeight:700, color:"var(--text)", letterSpacing:"-0.02em", marginBottom:5 },
  modalDesc: { fontSize:13, color:"var(--text-muted)", lineHeight:1.65, marginBottom:22 },
  modalBtn: { width:"100%", height:42, fontSize:14, fontWeight:600, background:"var(--text)", color:"var(--bg)", border:"none", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"-0.01em" },
  modalCancel: { width:"100%", marginTop:10, fontSize:12, fontFamily:"monospace", color:"var(--text-dim)", background:"none", border:"none", cursor:"pointer", padding:"8px 0" },
  modalNote: { textAlign:"center", fontSize:11, fontFamily:"monospace", color:"var(--border-2)", marginTop:18 },
  warn: { marginBottom:16, padding:"10px 14px", borderRadius:8, fontSize:12, background:"var(--yellow-bg)", border:"1px solid var(--yellow-border)", color:"var(--yellow)", lineHeight:1.5 },
  err: { marginBottom:16, padding:"10px 14px", borderRadius:8, fontSize:12, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"var(--red)", lineHeight:1.5 },
};

const HOW = {
  student:[
    { n:"01", t:"Connect Wallet", d:"Connect your Freighter wallet. Your wallet address is where you will receive XLM." },
    { n:"02", t:"Post a Request", d:"Describe your funding need, set a goal in XLM, and choose a deadline of 7, 14, or 30 days." },
    { n:"03", t:"Receive Funds", d:"Donors browse requests and send XLM directly to your wallet. No middlemen, no waiting." },
  ],
  donor:[
    { n:"01", t:"Connect Wallet", d:"Connect your Freighter wallet. Make sure you have test XLM — use Get Test XLM if needed." },
    { n:"02", t:"Browse Requests", d:"Read student funding requests. Filter by field, sort by urgency, search by keyword." },
    { n:"03", t:"Send XLM", d:"Pick who you want to support, enter an amount, and sign with Freighter. Funds arrive in seconds." },
  ],
};

function Modal({ role, onClose }) {
  const { connect, isConnecting, walletError, freighterInstalled } = useWallet();
  const navigate = useNavigate();
  const cfg = role==="student"
    ? { tag:"STUDENT", title:"Connect as Student", desc:"Post your funding request and receive XLM directly to your wallet." }
    : { tag:"DONOR",   title:"Connect as Donor",   desc:"Browse student requests and send XLM directly to who you want to support." };

  const go = async () => { await connect(role); navigate(role==="student"?"/student":"/donor"); };

  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={S.modal}>
        <div style={S.modalTag}>{cfg.tag}</div>
        <div style={S.modalTitle}>{cfg.title}</div>
        <div style={S.modalDesc}>{cfg.desc}</div>
        {freighterInstalled===false&&<div style={S.warn}>Freighter required. <a href="https://www.freighter.app" target="_blank" rel="noreferrer" style={{ textDecoration:"underline",fontWeight:600 }}>Install it here</a> and set to Testnet.</div>}
        {walletError&&<div style={S.err}>{walletError==="FREIGHTER_NOT_INSTALLED"?"Freighter not found.":walletError==="USER_DECLINED"?"Connection cancelled.":"Could not connect. Try again."}</div>}
        <button style={{ ...S.modalBtn,opacity:isConnecting||freighterInstalled===false?0.5:1 }} onClick={go} disabled={isConnecting||freighterInstalled===false}>
          {isConnecting?<><Loader2 style={{ width:16,height:16,animation:"spin 1s linear infinite" }}/>Connecting...</>:<>Connect Freighter<ArrowRight style={{ width:16,height:16 }}/></>}
        </button>
        <button style={S.modalCancel} onClick={onClose}>Cancel</button>
        <div style={S.modalNote}>Stellar Testnet · No real funds used</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [role, setRole] = useState(null);
  const { theme, toggle } = useTheme();
  const { activeRequests, donations } = useApp();
  const totalFunded = donations.reduce((s,d)=>s+(d.amount||0),0);

  return (
    <div style={S.page}>
      {/* Glow — dark only */}
      {theme==="dark"&&(
        <div style={{ position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0 }}>
          <div style={{ position:"absolute",top:-200,left:"50%",transform:"translateX(-50%)",width:800,height:600,background:"rgba(242,217,78,0.032)",borderRadius:"50%",filter:"blur(120px)" }}/>
        </div>
      )}

      {/* Navbar */}
      <header style={{ ...S.nav,position:"sticky",top:0,zIndex:50 }}>
        <div style={S.navInner}>
          <span style={S.brand}>ScholarChain</span>
          <span style={S.badge}>Testnet</span>
          <div style={S.navRight}>
            <button style={S.navLink} onClick={()=>setRole("student")}>Student</button>
            <button style={S.navLink} onClick={()=>setRole("donor")}>Donor</button>
            <button style={S.themeBtn} onClick={toggle} title="Toggle theme">
              {theme==="dark"?<Sun style={{ width:14,height:14 }}/>:<Moon style={{ width:14,height:14 }}/>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ flex:1,position:"relative",zIndex:1 }}>
        <div style={S.hero}>
          <div style={S.heroInner}>
            <span style={S.tag}>Built on Stellar Testnet</span>
            <h1 style={S.h1}>
              Fund education.<br/>
              <span style={S.yellow}>Directly on-chain.</span>
            </h1>
            <p style={S.sub}>
              Students post funding requests. Donors send XLM directly to student wallets.
              Every transaction is permanent, public, and verifiable on Stellar.
            </p>
            <div style={S.btnRow}>
              <button style={S.btnPrimary} onClick={()=>setRole("student")} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                <BookOpen style={{ width:16,height:16 }}/> I need funding
              </button>
              <button style={S.btnSecondary} onClick={()=>setRole("donor")} onMouseEnter={e=>e.currentTarget.style.background="var(--surface-2)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Wallet style={{ width:16,height:16 }}/> I want to donate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ ...S.statsBar,position:"relative",zIndex:1 }}>
        <div style={S.statsInner}>
          {[
            { l:"Active Requests", v: String(activeRequests.length||0) },
            { l:"Total XLM Funded", v: totalFunded>0?`${totalFunded.toFixed(0)} XLM`:"0 XLM" },
            { l:"Transaction Fee", v:"< $0.001" },
          ].map((s,i)=>(
            <div key={s.l} style={{ ...S.statItem, borderRight:i<2?"1px solid var(--border)":"none", paddingLeft:i===0?0:32, paddingRight:i===2?0:32 }}>
              <div style={S.statLabel}>{s.l}</div>
              <div style={S.statValue}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity strip */}
      <ActivityStrip/>

      {/* How it works */}
      <div style={{ position:"relative",zIndex:1 }}>
        <div style={S.howSection}>
          <div style={S.howTag}>How it works</div>
          <div style={S.howTitle}>Two roles. One platform.</div>
          <div style={S.cardsRow}>
            {["student","donor"].map(r=>(
              <div key={r} style={S.card}>
                <div style={S.cardTag}>{r==="student"?"For Students":"For Donors"}</div>
                {HOW[r].map(item=>(
                  <div key={item.n} style={S.stepRow}>
                    <div style={S.stepNum}>{item.n}</div>
                    <div>
                      <div style={S.stepTitle}>{item.t}</div>
                      <div style={S.stepDesc}>{item.d}</div>
                    </div>
                  </div>
                ))}
                <button style={S.cardBtn} onClick={()=>setRole(r)}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--yellow-border)"; e.currentTarget.style.color="var(--yellow)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.color="var(--text-muted)"; }}>
                  {r==="student"?"Post a request →":"Browse requests →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ ...S.footer,position:"relative",zIndex:1 }}>
        <div style={S.footerInner}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:14,fontWeight:700,color:"var(--text)",letterSpacing:"-0.02em" }}>ScholarChain</span>
            <span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>/ Stellar Testnet</span>
          </div>
          <div style={{ display:"flex",gap:20 }}>
            {[["stellar.org","https://stellar.org"],["Explorer","https://stellar.expert/explorer/testnet"],["Freighter","https://www.freighter.app"]].map(([l,h])=>(
              <a key={l} href={h} target="_blank" rel="noreferrer" style={S.footerLink}>{l}</a>
            ))}
          </div>
          <span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>All transactions on Testnet</span>
        </div>
      </footer>

      {role&&<Modal role={role} onClose={()=>setRole(null)}/>}
    </div>
  );
}
