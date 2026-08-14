import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

export default function RoleSelect() {
  const { connect, isConnecting, walletError, freighterInstalled } = useWallet();
  const [selected, setSelected] = useState(null);

  const roles = [
    {
      id: "provider",
      label: "Scholarship Provider",
      tag: "ADMIN",
      description: "Create scholarship pools, review student applications, and disburse funds.",
    },
    {
      id: "student",
      label: "Student Applicant",
      tag: "STUDENT",
      description: "Browse available scholarships, apply, and receive funding to your wallet.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* subtle radial gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#f2d94e]/3 rounded-full blur-[120px]" />
      </div>

      <header className="border-b border-[#1a1a1a] px-6 py-4 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5">
          <span className="text-sm font-semibold text-white tracking-tight">ScholarChain</span>
          <span className="text-[10px] font-mono bg-[#f2d94e]/10 text-[#f2d94e] border border-[#f2d94e]/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Testnet
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
        <div className="w-full max-w-md">

          <div className="mb-10">
            <div className="text-xs font-mono text-[#444] uppercase tracking-widest mb-4">
              SCHOLARCHAIN / CONNECT
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
              Select your role
            </h1>
            <p className="text-sm text-[#666] leading-relaxed">
              Choose how you are using ScholarChain for this session.
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {roles.map((role) => {
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[#f2d94e]/40 bg-[#f2d94e]/5"
                      : "border-[#1e1e1e] bg-[#111] hover:border-[#2a2a2a] hover:bg-[#141414]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono tracking-widest ${isSelected ? "text-[#f2d94e]" : "text-[#444]"}`}>
                      {role.tag}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#f2d94e]" />
                    )}
                  </div>
                  <div className={`text-sm font-semibold mb-1 ${isSelected ? "text-white" : "text-[#ccc]"}`}>
                    {role.label}
                  </div>
                  <div className={`text-xs leading-relaxed ${isSelected ? "text-[#888]" : "text-[#444]"}`}>
                    {role.description}
                  </div>
                </button>
              );
            })}
          </div>

          {walletError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {walletError === "FREIGHTER_NOT_INSTALLED" && (<>Freighter not found. <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="underline text-red-300">Install it</a></>)}
              {walletError === "USER_DECLINED" && "Connection cancelled."}
              {walletError === "CONNECTION_FAILED" && "Could not connect. Try again."}
            </div>
          )}

          {freighterInstalled === false && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#f2d94e]/5 border border-[#f2d94e]/20 text-sm text-[#f2d94e]">
              Freighter wallet required. <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="font-semibold underline">Install Freighter</a> and set it to Testnet.
            </div>
          )}

          <Button
            variant="default"
            className="w-full h-10 font-semibold"
            onClick={() => connect(selected)}
            disabled={!selected || isConnecting || freighterInstalled === false}
          >
            {isConnecting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting</>
              : <>Connect Freighter <ArrowRight className="w-4 h-4" /></>
            }
          </Button>

          <p className="text-center text-xs text-[#333] mt-4 font-mono">
            Stellar Testnet / No real funds used
          </p>
        </div>
      </main>
    </div>
  );
}
