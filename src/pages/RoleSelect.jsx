import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, GraduationCap, ArrowRight } from "lucide-react";

export default function RoleSelect() {
  const { connect, isConnecting, walletError, freighterInstalled } = useWallet();
  const [selected, setSelected] = useState(null);

  const roles = [
    {
      id: "provider",
      label: "Scholarship Provider",
      description: "Create scholarship pools, review applications, and disburse funds to students.",
      icon: Building2,
    },
    {
      id: "student",
      label: "Student Applicant",
      description: "Browse available scholarships, submit applications, and receive funding.",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="font-['Syne'] font-extrabold text-lg tracking-tight text-stone-900">ScholarChain</span>
          <span className="text-xs font-bold bg-[#F2D94E] text-stone-900 px-2 py-0.5 rounded-full uppercase tracking-wider">Testnet</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <div className="mb-10">
            <h1 className="font-['Syne'] text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
              How are you using ScholarChain today?
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed">
              Choose your role for this session. You can return and switch roles at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  className={`text-left p-6 rounded-lg border-2 transition-all bg-white ${
                    isSelected ? "border-stone-900 shadow-sm" : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 ${isSelected ? "bg-stone-900" : "bg-stone-100"}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-stone-500"}`} />
                  </div>
                  <div className="font-['Syne'] font-bold text-stone-900 mb-1.5">{role.label}</div>
                  <p className="text-sm text-stone-500 leading-relaxed">{role.description}</p>
                  {isSelected && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-stone-900">
                      Selected <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {walletError && (
            <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              {walletError === "FREIGHTER_NOT_INSTALLED" && (<>Freighter not found. <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="underline font-medium">Install it here</a></>)}
              {walletError === "USER_DECLINED" && "Connection cancelled."}
              {walletError === "CONNECTION_FAILED" && "Could not connect. Please try again."}
            </div>
          )}

          {freighterInstalled === false && (
            <div className="mb-4 px-4 py-3 rounded-md bg-[#FBF0A8] border border-[#e8d84a] text-sm text-stone-700">
              Freighter wallet extension is required. <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="font-semibold underline">Install Freighter</a> and set it to Testnet.
            </div>
          )}

          <Button className="w-full h-11 text-sm font-semibold" onClick={() => connect(selected)} disabled={!selected || isConnecting || freighterInstalled === false}>
            {isConnecting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Connecting Wallet</>) : (<>Connect Freighter Wallet <ArrowRight className="w-4 h-4" /></>)}
          </Button>

          <p className="text-center text-xs text-stone-400 mt-4">
            All transactions are on Stellar Testnet. No real funds are used.
          </p>
        </div>
      </main>
    </div>
  );
}
