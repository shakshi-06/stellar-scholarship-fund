import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import Footer from "../components/Footer";
import ActivityStrip from "../components/ActivityStrip";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, BookOpen, Wallet, Sun, Moon } from "lucide-react";

function ConnectModal({ role, onClose }) {
  const { connect, isConnecting, walletError, freighterInstalled } = useWallet();
  const navigate = useNavigate();

  const config = {
    student: {
      tag: "STUDENT",
      title: "Connect as Student",
      desc: "Post your funding request and receive XLM directly to your wallet.",
    },
    donor: {
      tag: "DONOR",
      title: "Connect as Donor",
      desc: "Browse student requests and send XLM directly to who you want to support.",
    },
  }[role];

  const handleConnect = async () => {
    await connect(role);
    navigate(role === "student" ? "/student" : "/donor");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}>
        <div className="mb-5">
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--yellow)" }}>{config.tag}</span>
          <h2 className="text-base font-semibold mt-1.5 tracking-tight" style={{ color: "var(--text)" }}>{config.title}</h2>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{config.desc}</p>
        </div>

        {freighterInstalled === false && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-xs" style={{ background: "var(--yellow-bg)", border: "1px solid var(--yellow-border)", color: "var(--yellow)" }}>
            Freighter wallet required.{" "}
            <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="underline font-semibold">Install Freighter</a>{" "}
            and set it to Testnet.
          </div>
        )}

        {walletError && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-xs text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {walletError === "FREIGHTER_NOT_INSTALLED" && "Freighter not found. Install it first."}
            {walletError === "USER_DECLINED" && "Connection cancelled."}
            {walletError === "CONNECTION_FAILED" && "Could not connect. Try again."}
          </div>
        )}

        <Button className="w-full h-10" onClick={handleConnect} disabled={isConnecting || freighterInstalled === false}>
          {isConnecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting</> : <>Connect Freighter <ArrowRight className="w-4 h-4" /></>}
        </Button>

        <button onClick={onClose} className="w-full mt-3 text-xs font-mono transition-colors" style={{ color: "var(--text-dim)" }}>
          Cancel
        </button>

        <p className="text-center text-xs mt-4 font-mono" style={{ color: "var(--border-2)" }}>
          Stellar Testnet / No real funds used
        </p>
      </div>
    </div>
  );
}

const HOW_IT_WORKS = {
  student: [
    { step: "01", title: "Connect Wallet", desc: "Connect your Freighter wallet. Your wallet address is where you will receive XLM." },
    { step: "02", title: "Post a Request", desc: "Describe your funding need, set a goal in XLM, and choose a deadline of 7, 14, or 30 days." },
    { step: "03", title: "Receive Funds", desc: "Donors browse requests and send XLM directly to your wallet. No middlemen, no waiting." },
  ],
  donor: [
    { step: "01", title: "Connect Wallet", desc: "Connect your Freighter wallet. Make sure you have test XLM — use Get Test XLM if needed." },
    { step: "02", title: "Browse Requests", desc: "Read student funding requests. Filter by field, sort by urgency, search by keyword." },
    { step: "03", title: "Send XLM", desc: "Pick who you want to support, enter an amount, and sign with Freighter. Funds arrive in seconds." },
  ],
};

export default function Landing() {
  const [connectRole, setConnectRole] = useState(null);
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* Subtle glow — dark only */}
      {theme === "dark" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full"
            style={{ background: "rgba(242,217,78,0.04)", filter: "blur(140px)" }} />
        </div>
      )}

      {/* Navbar */}
      <header className="relative z-10 border-b" style={{ borderColor: "var(--border)", background: "var(--nav-bg)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text)" }}>ScholarChain</span>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: "var(--yellow-bg)", color: "var(--yellow)", border: "1px solid var(--yellow-border)" }}>
            Testnet
          </span>
          <div className="ml-auto flex items-center gap-5">
            <button onClick={() => setConnectRole("student")} className="text-xs font-mono transition-colors hover:opacity-100 opacity-60" style={{ color: "var(--text)" }}>
              Student
            </button>
            <button onClick={() => setConnectRole("donor")} className="text-xs font-mono transition-colors hover:opacity-100 opacity-60" style={{ color: "var(--text)" }}>
              Donor
            </button>
            <button onClick={toggle} className="transition-colors opacity-60 hover:opacity-100" style={{ color: "var(--text)" }}>
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 w-full">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: "var(--text-dim)" }}>
              Built on Stellar Testnet
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] mb-6">
              Fund education.<br />
              <span style={{ color: "var(--yellow)" }}>Directly on-chain.</span>
            </h1>
            <p className="text-base leading-relaxed mb-10 max-w-lg" style={{ color: "var(--text-muted)" }}>
              Students post funding requests. Donors send XLM directly to student wallets.
              Every transaction is permanent, public, and verifiable on Stellar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConnectRole("student")}
                className="flex items-center justify-center gap-2.5 h-11 px-6 text-sm font-semibold rounded-md transition-opacity hover:opacity-80"
                style={{ background: "var(--text)", color: "var(--bg)" }}
              >
                <BookOpen className="w-4 h-4" /> I need funding
              </button>
              <button
                onClick={() => setConnectRole("donor")}
                className="flex items-center justify-center gap-2.5 h-11 px-6 text-sm font-semibold rounded-md transition-colors"
                style={{ border: "1px solid var(--border-2)", background: "transparent", color: "var(--text)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Wallet className="w-4 h-4" /> I want to donate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 divide-x" style={{ "--tw-divide-opacity": 1 }}>
          {[
            { label: "Network", value: "Stellar Testnet" },
            { label: "Finality", value: "~5 seconds" },
            { label: "Transaction fee", value: "< $0.001" },
          ].map((s, i) => (
            <div key={s.label} className={`py-1 text-center sm:text-left ${i === 0 ? "pr-6" : i === 1 ? "px-6" : "pl-6"}`}
              style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--text-dim)" }}>{s.label}</div>
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity strip */}
      <ActivityStrip />

      {/* How it works */}
      <section className="relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>How it works</div>
          <h2 className="text-2xl font-semibold tracking-tight mb-12" style={{ color: "var(--text)" }}>Two roles. One platform.</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["student", "donor"].map(roleKey => (
              <div key={roleKey} className="rounded-xl p-6"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: "var(--yellow)" }}>
                  {roleKey === "student" ? "For Students" : "For Donors"}
                </div>
                <div className="space-y-5">
                  {HOW_IT_WORKS[roleKey].map(item => (
                    <div key={item.step} className="flex gap-4">
                      <div className="text-xs font-mono w-6 flex-shrink-0 pt-0.5" style={{ color: "var(--text-dim)" }}>{item.step}</div>
                      <div>
                        <div className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{item.title}</div>
                        <div className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setConnectRole(roleKey)}
                  className="mt-6 w-full h-9 text-xs font-mono rounded-md transition-colors"
                  style={{ border: "1px solid var(--border-2)", color: "var(--text-muted)", background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--yellow-border)"; e.currentTarget.style.color = "var(--yellow)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  {roleKey === "student" ? "Post a request" : "Browse requests"} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {connectRole && <ConnectModal role={connectRole} onClose={() => setConnectRole(null)} />}
    </div>
  );
}
