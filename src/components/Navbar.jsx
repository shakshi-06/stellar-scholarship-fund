import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw, Sun, Moon } from "lucide-react";
import { formatXLM, shortAddress, fundTestnetAccount } from "../utils/stellar";
import { useState } from "react";

export default function Navbar() {
  const { publicKey, balance, isLoadingBalance, role, disconnect, refreshBalance } = useWallet();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
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

  const handleDisconnect = () => {
    disconnect();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-4">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 mr-auto hover:opacity-80 transition-opacity"
        >
          <span className="text-sm font-semibold tracking-tight text-[var(--text)]">ScholarChain</span>
          <span className="text-[10px] font-mono bg-[var(--yellow-bg)] text-[var(--yellow)] border border-[var(--yellow-border)] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Testnet
          </span>
          {role && (
            <span className="text-xs text-[var(--text-dim)] hidden sm:inline font-mono">
              / {role}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark"
            ? <Sun className="w-3.5 h-3.5" />
            : <Moon className="w-3.5 h-3.5" />
          }
        </button>

        {publicKey && (
          <>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[var(--text-dim)] font-mono">
                {isLoadingBalance ? "..." : `${formatXLM(balance)} XLM`}
              </span>
              <button onClick={() => refreshBalance()} className="text-[var(--border-2)] hover:text-[var(--text-muted)] transition-colors">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="h-3 w-px bg-[var(--border)] hidden sm:block" />

            <span className="font-mono text-xs text-[var(--text-dim)] hidden sm:block">
              {shortAddress(publicKey)}
            </span>

            {parseFloat(balance) < 10 && (
              <Button variant="yellow" size="sm" onClick={handleFund} disabled={funding} className="hidden sm:flex text-xs h-7">
                {funded ? "Funded" : funding ? "..." : "Get Test XLM"}
              </Button>
            )}

            <button
              onClick={handleDisconnect}
              className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors ml-1"
              title="Disconnect"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
