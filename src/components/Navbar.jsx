import { useWallet } from "../context/WalletContext";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw } from "lucide-react";
import { formatXLM, shortAddress, fundTestnetAccount } from "../utils/stellar";
import { useState } from "react";

export default function Navbar() {
  const { publicKey, balance, isLoadingBalance, role, disconnect, refreshBalance } = useWallet();
  const [funding, setFunding] = useState(false);
  const [funded, setFunded] = useState(false);

  const handleFund = async () => {
    setFunding(true);
    try {
      await fundTestnetAccount(publicKey);
      await refreshBalance();
      setFunded(true);
      setTimeout(() => setFunded(false), 3000);
    } catch {}
    finally { setFunding(false); }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-4">
        <div className="flex items-center gap-2.5 mr-auto">
          <span className="text-sm font-semibold tracking-tight text-white">ScholarChain</span>
          <span className="text-[10px] font-mono bg-[#f2d94e]/10 text-[#f2d94e] border border-[#f2d94e]/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Testnet
          </span>
          {role && (
            <span className="text-xs text-[#333] hidden sm:inline font-mono">
              / {role}
            </span>
          )}
        </div>

        {publicKey && (
          <>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#444] font-mono">
                {isLoadingBalance ? "..." : `${formatXLM(balance)} XLM`}
              </span>
              <button
                onClick={() => refreshBalance()}
                className="text-[#2a2a2a] hover:text-[#666] transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="h-3 w-px bg-[#1e1e1e] hidden sm:block" />

            <span className="font-mono text-xs text-[#333] hidden sm:block">
              {shortAddress(publicKey)}
            </span>

            {parseFloat(balance) < 10 && (
              <Button
                variant="yellow"
                size="sm"
                onClick={handleFund}
                disabled={funding}
                className="hidden sm:flex text-xs h-7"
              >
                {funded ? "Funded" : funding ? "..." : "Get Test XLM"}
              </Button>
            )}

            <button
              onClick={disconnect}
              className="text-[#2a2a2a] hover:text-white transition-colors ml-1"
              title="Disconnect — return to landing page"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
