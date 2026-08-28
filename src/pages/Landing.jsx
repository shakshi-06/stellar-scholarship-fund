import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import ActivityStrip from "../components/ActivityStrip";
import { useApp } from "../context/AppContext";
import { Loader2, ArrowRight, BookOpen, Wallet, Sun, Moon } from "lucide-react";

const S = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", color: "var(--text)" },
  nav: { borderBottom: "1px solid var(--border)", background: "var(--nav-bg)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 },
  navInner: { maxWidth: 1024, margin: "0 auto", padding: "0 24px", height: 48, display: "flex", alignItems: "center", gap: 12 },
  brand: { fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", background: "none", border: "none", cursor: "pointer" },
  badge: { fontSize: 10, fontFamily: "monospace", fontWeight: 500, background: "var(--yellow-bg)", color: "var(--yellow)", border: "1px solid var(--yellow-border)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.08em" },
  navRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 },
  navLink: { fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" },
  themeBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" },
  hero: { flex: 1, maxWidth: 1024, margin: "0 auto", padding: "96px 24px 80px", width: "100%" },
  heroInner: { maxWidth: 640 },
  tag: { fontSize: 11, fontFamily: "monospace", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 24, display: "block" },
  h1: { fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24, color: "var(--text)" },
  yellow: { color: "var(--yellow)" },
  sub: { fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 40, maxWidth: 480 },
  btnRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  btnPrimary: { display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, background: "var(--text)", color: "var(--bg)", border: "none", cursor: "pointer" },
  btnSecondary: { display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, background: "transparent", color: "var(--text)", border: "1px solid var(--border-2)", cursor: "pointer" },
  statsBar: { borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)" },
  statsInner: { maxWidth: 1024, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 },
  statItem: { padding: "0 24px", borderRight: "1px solid var(--border)" },
  statLabel: { fontSize: 10, fontFamily: "monospace", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 },
  statValue: { fontSize: 14, fontWeight: 600, color: "var(--text)" },
  howSection: { maxWidth: 1024, margin: "0 auto", padding: "80px 24px" },
  howTag: { fontSize: 10, fontFamily: "monospace", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 },
  howTitle: { fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 48 },
  cardsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 },
  card: { background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 24 },
  cardTag: { fontSize: 10, fontFamily: "monospace", color: "var(--yellow)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 },
  stepRow: { display: "flex", gap: 16, marginBottom: 20 },
  stepNum: { fontSize: 11, fontFamily: "monospace", color: "var(--text-dim)", width: 20, flexShrink: 0, paddingTop: 2 },
  stepTitle: { fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 },
  stepDesc: { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 },
  cardBtn: { marginTop: 20, width: "100%", height: 36, fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)", background: "transparent", border: "1px solid var(--border-2)", borderRadius: 8, cursor: "pointer" },
  footer: { borderTop: "1px solid var(--border)", background: "var(--footer-bg)", padding: "20px 24px" },
  footerInner: { maxWidth: 1024, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  footerLinks: { display: "flex", gap: 20 },
  footerLink: { fontSize: 12, fontFamily: "monospace", color: "var(--text-dim)", textDecoration: "none" },
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modal: { width: "100%", maxWidth: 400, background: "var(--surface)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 24, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
  modalTag: { fontSize: 10, fontFamily: "monospace", color: "var(--yellow)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 },
  modalTitle: { fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em", marginBottom: 4 },
  modalDesc: { fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 },
  modalBtn: { width: "100%", height: 40, fontSize: 14, fontWeight: 600, background: "var(--text)", color: "var(--bg)", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  modalCancel: { width: "100%", marginTop: 12, fontSize: 12, fontFamily: "monospace", color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer", padding: "8px 0" },
  modalNote: { textAlign: "center", fontSize: 11, fontFamily: "monospace", color: "var(--border-2)", marginTop: 16 },
  warn: { marginBottom: 16, padding: "10px 12px", borderRadius: 8, fontSize: 12, background: "var(--yellow-bg)", border: "1px solid var(--yellow-border)", color: "var(--yellow)" },
  err: { marginBottom: 16, padding: "10px 12px", borderRadius: 8, fontSize: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" },
};

const HOW = {
  student: [
    { n:"01", t:"Connect Wallet", d:"Connect your Freighter wallet. Your wallet address is where you will receive XLM." },
    { n:"02", t:"Post a Request", d:"Describe your funding need, set a goal in XLM, and choose a deadline of 7, 14, or 30 days." },
    { n:"03", t:"Receive Funds", d:"Donors browse requests and send XLM directly to your wallet. No middlemen, no waiting." },
  ],
  donor: [
    { n:"01", t:"Connect Wallet", d:"Connect your Freighter wallet. Make sure you have test XLM — use Get Test XLM if needed." },
    { n:"02", t:"Browse Requests", d:"Read student funding requests. Filter by field, sort by urgency, search by keyword." },
    { n:"03", t:"Send XLM", d:"Pick who you want to support, enter an amount, and sign with Freighter. Funds arrive in seconds." },
  ],
};

function Modal({ role, onClose }) {
  const { connect, isConnecting, walletError, freighterInstalled } = useWallet();
  const navigate = useNavigate();
  const cfg = role === "student"
    ? { tag:"STUDENT", title:"Connect as Student", desc:"Post your funding request and receive XLM directly to your wallet." }
    : { tag:"DONOR",   title:"Connect as Donor",   desc:"Browse student requests and send XLM directly to who you want to support." };

  const go = async () => { await connect(role); navigate(role === "student" ? "/student" : "/donor"); };

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalTag}>{cfg.tag}</div>
        <div style={S.modalTitle}>{cfg.title}</div>
        <div style={S.modalDesc}>{cfg.desc}</div>
        {freighterInstalled === false && (
          <div style={S.warn}>Freighter required. <a href="https://www.freighter.app" target="_blank" rel="noreferrer" style={{ textDecoration:"underline", fontWeight:600 }}>Install it here</a> and set to Testnet.</div>
        )}
        {walletError && (
          <div style={S.err}>
            {walletError === "FREIGHTER_NOT_INSTALLED" && "Freighter not found."}
            {walletError === "USER_DECLINED" && "Connection cancelled."}
            {walletError === "CONNECTION_FAILED" && "Could not connect. Try again."}
          </div>
        )}
        <button style={{ ...S.modalBtn, opacity: isConnecting || freighterInstalled === false ? 0.5 : 1 }}
          onClick={go} disabled={isConnecting || freighterInstalled === false}>
          {isConnecting ? <><Loader2 style={{ width:16, height:16, animation:"spin 1s linear infinite" }} /> Connecting</> : <>Connect Freighter <ArrowRight style={{ width:16, height:16 }} /></>}
        </button>
        <button style={S.modalCancel} onClick={onClose}>Cancel</button>
        <div style={S.modalNote}>Stellar Testnet / No real funds used</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [role, setRole] = useState(null);
  const { theme, toggle } = useTheme();
  const { activeRequests, donations } = useApp();
  const totalFunded = donations.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div style={S.page}>
      {/* Navbar */}
      <header style={S.nav}>
        <div style={S.navInner}>
          <span style={S.brand}>ScholarChain</span>
          <span style={S.badge}>Testnet</span>
          <div style={S.navRight}>
            <button style={S.navLink} onClick={() => setRole("student")}>Student</button>
            <button style={S.navLink} onClick={() => setRole("donor")}>Donor</button>
            <button style={S.themeBtn} onClick={toggle} title="Toggle theme">
              {theme === "dark" ? <Sun style={{ width:14, height:14 }} /> : <Moon style={{ width:14, height:14 }} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ flex:1 }}>
        <div style={S.hero}>
          <div style={S.heroInner}>
            <span style={S.tag}>Built on Stellar Testnet</span>
            <h1 style={S.h1}>
              Fund education.<br />
              <span style={S.yellow}>Directly on-chain.</span>
            </h1>
            <p style={S.sub}>
              Students post funding requests. Donors send XLM directly to student wallets.
              Every transaction is permanent, public, and verifiable on Stellar.
            </p>
            <div style={S.btnRow}>
              <button style={S.btnPrimary} onClick={() => setRole("student")}>
                <BookOpen style={{ width:16, height:16 }} /> I need funding
              </button>
              <button style={S.btnSecondary} onClick={() => setRole("donor")}>
                <Wallet style={{ width:16, height:16 }} /> I want to donate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsBar}>
        <div style={S.statsInner}>
          {[
            { l:"Active Requests", v: activeRequests.length || "0" },
            { l:"Total XLM Funded", v: totalFunded > 0 ? `${totalFunded.toFixed(0)} XLM` : "0 XLM" },
            { l:"Transaction Fee", v:"< $0.001" },
          ].map((s, i) => (
            <div key={s.l} style={{ ...S.statItem, borderRight: i < 2 ? "1px solid var(--border)" : "none", paddingLeft: i === 0 ? 0 : 24 }}>
              <div style={S.statLabel}>{s.l}</div>
              <div style={S.statValue}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Strip */}
      <ActivityStrip />

      {/* How it works */}
      <div>
        <div style={S.howSection}>
          <div style={S.howTag}>How it works</div>
          <div style={S.howTitle}>Two roles. One platform.</div>
          <div style={S.cardsRow}>
            {["student", "donor"].map(r => (
              <div key={r} style={S.card}>
                <div style={S.cardTag}>{r === "student" ? "For Students" : "For Donors"}</div>
                {HOW[r].map(item => (
                  <div key={item.n} style={S.stepRow}>
                    <div style={S.stepNum}>{item.n}</div>
                    <div>
                      <div style={S.stepTitle}>{item.t}</div>
                      <div style={S.stepDesc}>{item.d}</div>
                    </div>
                  </div>
                ))}
                <button style={S.cardBtn} onClick={() => setRole(r)}>
                  {r === "student" ? "Post a request" : "Browse requests"} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14, fontWeight:600, color:"var(--text)" }}>ScholarChain</span>
            <span style={{ fontSize:12, fontFamily:"monospace", color:"var(--text-dim)" }}>/ Stellar Testnet</span>
          </div>
          <div style={S.footerLinks}>
            <a href="https://stellar.org" target="_blank" rel="noreferrer" style={S.footerLink}>stellar.org</a>
            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" style={S.footerLink}>Explorer</a>
            <a href="https://www.freighter.app" target="_blank" rel="noreferrer" style={S.footerLink}>Freighter</a>
          </div>
          <span style={{ fontSize:11, fontFamily:"monospace", color:"var(--text-dim)" }}>All transactions on Testnet</span>
        </div>
      </footer>

      {role && <Modal role={role} onClose={() => setRole(null)} />}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
