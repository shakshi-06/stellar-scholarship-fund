import { useWallet } from "../context/WalletContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, RefreshCw, Building2, GraduationCap } from "lucide-react";
import { formatXLM, shortAddress, fundTestnetAccount } from "../utils/stellar";
import { useState } from "react";

export default function Navbar() {
  const { publicKey, balance, isLoadingBalance, role, disconnect, refreshBalance } = useWallet();
  const [funding, setFunding] = useState(false);

  const handleFund = async () => {
    setFunding(true);
    try {
      await fundTestnetAccount(publicKey);
      await refreshBalance();
    } catch {}
    finally { setFunding(false); }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mr-auto">
          <span className="font-['Syne'] font-extrabold text-base tracking-tight text-stone-900">
            ScholarChain
          </span>
          <span className="text-[10px] font-bold bg-[#F2D94E] text-stone-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Testnet
          </span>
        </div>

        {/* Role badge */}
        {role && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
            {role === "provider"
              ? <><Building2 className="w-3.5 h-3.5" /> Provider</>
              : <><GraduationCap className="w-3.5 h-3.5" /> Student</>
            }
          </div>
        )}

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Balance */}
        {publicKey && (
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-stone-400 text-xs">Balance</span>
            <span className="font-semibold text-stone-900">
              {isLoadingBalance ? "..." : `${formatXLM(balance)} XLM`}
            </span>
            <button onClick={() => refreshBalance()} className="text-stone-400 hover:text-stone-600 transition-colors" title="Refresh balance">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Wallet pill */}
        {publicKey && (
          <div className="flex items-center gap-2 bg-stone-100 rounded-md px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-stone-700 font-mono">
              {shortAddress(publicKey)}
            </span>
          </div>
        )}

        {/* Get test XLM */}
        {publicKey && parseFloat(balance) < 10 && (
          <Button variant="outline" size="sm" onClick={handleFund} disabled={funding} className="hidden sm:flex text-xs h-8">
            {funding ? "Funding..." : "Get Test XLM"}
          </Button>
        )}

        {/* Disconnect */}
        {publicKey && (
          <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect" className="h-8 w-8">
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
