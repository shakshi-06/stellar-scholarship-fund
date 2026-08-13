import { useState } from "react";
import ActivityStrip from "../components/ActivityStrip";
import { useWallet } from "../context/WalletContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, BookOpen, Wallet } from "lucide-react";

function ConnectModal({ role, onClose }) {
  const { connect, isConnecting, walletError, freighterInstalled } = useWallet();

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="mb-5">
          <span className="text-xs font-mono text-[#f2d94e] uppercase tracking-widest">{config.tag}</span>
          <h2 className="text-base font-semibold text-white mt-1.5 tracking-tight">{config.title}</h2>
          <p className="text-sm text-[#666] mt-1 leading-relaxed">{config.desc}</p>
        </div>

        {freighterInstalled === false && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-[#f2d94e]/5 border border-[#f2d94e]/20 text-xs text-[#f2d94e]">
            Freighter wallet required.{" "}
            <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="underline font-semibold">
              Install Freighter
            </a>{" "}
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
          onClick={() => connect(role)}
          disabled={isConnecting || freighterInstalled === false}
        >
          {isConnecting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting</>
            : <>Connect Freighter <ArrowRight className="w-4 h-4" /></>
          }
        </Button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-xs text-[#444] hover:text-[#888] transition-colors font-mono"
        >
          Cancel
        </button>

        <p className="text-center text-xs text-[#2a2a2a] mt-4 font-mono">
          Stellar Testnet / No real funds
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
    { step: "01", title: "Connect Wallet", desc: "Connect your Freighter wallet. Make sure you have test XLM — use the Friendbot if needed." },
    { step: "02", title: "Browse Requests", desc: "Read student funding requests. Filter by field, sort by urgency, search by keyword." },
    { step: "03", title: "Send XLM", desc: "Pick who you want to support, enter an amount, and sign with Freighter. Funds arrive in seconds." },
  ],
};

export default function Landing() {
  const [connectRole, setConnectRole] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#f2d94e]/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-white">ScholarChain</span>
          <span className="text-[10px] font-mono bg-[#f2d94e]/10 text-[#f2d94e] border border-[#f2d94e]/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Testnet
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setConnectRole("student")}
              className="text-xs text-[#666] hover:text-white transition-colors font-mono"
            >
              Student
            </button>
            <button
              onClick={() => setConnectRole("donor")}
              className="text-xs text-[#666] hover:text-white transition-colors font-mono"
            >
              Donor
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-2xl">
          <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-6">
            Built on Stellar Testnet
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] mb-6">
            Fund education.<br />
            <span className="text-[#f2d94e]">Directly on-chain.</span>
          </h1>
          <p className="text-[#666] text-base leading-relaxed mb-10 max-w-lg">
            Students post funding requests. Donors send XLM directly to student wallets.
            Every transaction is permanent, public, and verifiable on Stellar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConnectRole("student")}
              className="flex items-center justify-center gap-2.5 h-11 px-6 bg-white text-black text-sm font-semibold rounded-md hover:bg-neutral-200 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              I need funding
            </button>
            <button
              onClick={() => setConnectRole("donor")}
              className="flex items-center justify-center gap-2.5 h-11 px-6 border border-[#2a2a2a] bg-transparent text-white text-sm font-semibold rounded-md hover:border-[#444] hover:bg-[#1a1a1a] transition-colors"
            >
              <Wallet className="w-4 h-4" />
              I want to donate
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 divide-x divide-[#1a1a1a]">
          {[
            { label: "Network", value: "Stellar Testnet" },
            { label: "Finality", value: "~5 seconds" },
            { label: "Transaction fee", value: "< $0.001" },
          ].map(s => (
            <div key={s.label} className="px-6 first:pl-0 last:pr-0 text-center sm:text-left">
              <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-sm font-semibold text-white">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      <ActivityStrip />

      {/* How it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20" id="how">
        <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-3">
          How it works
        </div>
        <h2 className="text-2xl font-semibold tracking-tight mb-12">
          Two roles. One platform.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["student", "donor"].map(roleKey => (
            <div key={roleKey} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-6">
              <div className="text-xs font-mono text-[#f2d94e] uppercase tracking-widest mb-4">
                {roleKey === "student" ? "For Students" : "For Donors"}
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS[roleKey].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="text-xs font-mono text-[#333] w-6 flex-shrink-0 pt-0.5">{item.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                      <div className="text-xs text-[#555] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setConnectRole(roleKey)}
                className="mt-6 w-full h-9 border border-[#2a2a2a] text-xs text-[#888] font-mono rounded-md hover:border-[#f2d94e]/40 hover:text-[#f2d94e] transition-colors"
              >
                {roleKey === "student" ? "Post a request" : "Browse requests"} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1a1a1a] py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">ScholarChain</span>
            <span className="text-xs text-[#333] font-mono">/ Stellar Testnet</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-[#333]">
            <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-[#888] transition-colors">stellar.org</a>
            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:text-[#888] transition-colors">Explorer</a>
            <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="hover:text-[#888] transition-colors">Freighter</a>
          </div>
        </div>
      </footer>

      {connectRole && (
        <ConnectModal role={connectRole} onClose={() => setConnectRole(null)} />
      )}
    </div>
  );
}
