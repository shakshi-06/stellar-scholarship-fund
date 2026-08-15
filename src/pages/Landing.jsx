import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import Footer from "../components/Footer";
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
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--card-border)] rounded-xl p-6 shadow-2xl">
        <div className="mb-5">
          <span className="text-xs font-mono text-[var(--yellow)] uppercase tracking-widest">{config.tag}</span>
          <h2 className="text-base font-semibold text-[var(--text)] mt-1.5 tracking-tight">{config.title}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">{config.desc}</p>
        </div>

        {freighterInstalled === false && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-[var(--yellow-bg)] border border-[var(--yellow-border)] text-xs text-[var(--yellow)]">
            Freighter wallet required.{" "}
            <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="underline font-semibold">Install Freighter</a>{" "}
            and set it to Testnet.
          </div>
        )}

        {walletError && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {walletError === "FREIGHTER_NOT_INSTALLED" && "Freighter not found. Install it first."}
            {walletError === "USER_DECLINED" && "Connection cancelled."}
            {walletError === "CONNECTION_FAILED" && "Could not connect. Try again."}
          </div>
        )}

        <Button
          className="w-full h-10"
          onClick={handleConnect}
          disabled={isConnecting || freighterInstalled === false}
        >
          {isConnecting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting</>
            : <>Connect Freighter <ArrowRight className="w-4 h-4" /></>
          }
        </Button>

        <button onClick={onClose} className="w-full mt-3 text-xs text-[var(--text-dim)] hover:text-[var(--text-muted)] transition-colors font-mono">
          Cancel
        </button>

        <p className="text-center text-xs text-[var(--border-2)] mt-4 font-mono">
          Stellar Testnet / No real funds used
        </p>
      </div>
    </div>
  );
}

const HOW_IT_WORKS = {
  student: [
    { step: "01", title: "Connect Wallet", desc: "Connect your Freighter wallet. Your wallet address is where you will receive XLM." },
    { step: "02", title: "Post a Request", desc: "Describe your funding need, set a goal amount in XLM, and choose a deadline of 7, 14, or 30 days." },
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* Background glow — only in dark mode */}
      {theme === "dark" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#f2d94e]/3 rounded-full blur-[140px]" />
        </div>
      )}

      {/* Navbar */}
      <header className="relative z-10 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-[var(--text)]">ScholarChain</span>
          <span className="text-[10px] font-mono bg-[var(--yellow-bg)] text-[var(--yellow)] border border-[var(--yellow-border)] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Testnet
          </span>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setConnectRole("student")}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-mono"
            >
              Student
            </button>
            <button
              onClick={() => setConnectRole("donor")}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-mono"
            >
              Donor
            </button>
            <button onClick={toggle} className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <div className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-6">
            Built on Stellar Testnet
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] mb-6 text-[var(--text)]">
            Fund education.<br />
            <span className="text-[var(--yellow)]">Directly on-chain.</span>
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed mb-10 max-w-lg">
            Students post funding requests. Donors send XLM directly to student wallets.
            Every transaction is permanent, public, and verifiable on Stellar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConnectRole("student")}
              className="flex items-center justify-center gap-2.5 h-11 px-6 bg-[var(--text)] text-[var(--bg)] text-sm font-semibold rounded-md hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-4 h-4" /> I need funding
            </button>
            <button
              onClick={() => setConnectRole("donor")}
              className="flex items-center justify-center gap-2.5 h-11 px-6 border border-[var(--border-2)] bg-transparent text-[var(--text)] text-sm font-semibold rounded-md hover:bg-[var(--surface-2)] transition-colors"
            >
              <Wallet className="w-4 h-4" /> I want to donate
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-[var(--border)]">
          {[
            { label: "Network", value: "Stellar Testnet" },
            { label: "Finality", value: "~5 seconds" },
            { label: "Transaction fee", value: "< $0.001" },
          ].map(s => (
            <div key={s.label} className="px-6 first:pl-0 last:pr-0 text-center sm:text-left">
              <div className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-sm font-semibold text-[var(--text)]">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-3">How it works</div>
        <h2 className="text-2xl font-semibold tracking-tight mb-12 text-[var(--text)]">Two roles. One platform.</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["student", "donor"].map(roleKey => (
            <div key={roleKey} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
              <div className="text-xs font-mono text-[var(--yellow)] uppercase tracking-widest mb-5">
                {roleKey === "student" ? "For Students" : "For Donors"}
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS[roleKey].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="text-xs font-mono text-[var(--text-dim)] w-6 flex-shrink-0 pt-0.5">{item.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text)] mb-1">{item.title}</div>
                      <div className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setConnectRole(roleKey)}
                className="mt-6 w-full h-9 border border-[var(--border-2)] text-xs text-[var(--text-muted)] font-mono rounded-md hover:border-[var(--yellow-border)] hover:text-[var(--yellow)] transition-colors"
              >
                {roleKey === "student" ? "Post a request" : "Browse requests"} →
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {connectRole && <ConnectModal role={connectRole} onClose={() => setConnectRole(null)} />}
    </div>
  );
}
