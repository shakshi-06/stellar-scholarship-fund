import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useTheme } from "../context/ThemeContext";
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

  const handleDisconnect = () => { disconnect(); navigate("/"); };

  const navStyle = {
    position: "sticky", top: 0, zIndex: 50,
    borderBottom: "1px solid var(--border)",
    background: "var(--nav-bg)",
    backdropFilter: "blur(12px)",
  };

  const textStyle = { color: "var(--text)" };
  const mutedStyle = { color: "var(--text-dim)" };
  const yellowBadge = {
    fontSize: "10px", fontFamily: "monospace", fontWeight: 500,
    background: "var(--yellow-bg)", color: "var(--yellow)",
    border: "1px solid var(--yellow-border)",
    padding: "2px 6px", borderRadius: "4px",
    textTransform: "uppercase", letterSpacing: "0.08em",
  };

  return (
    <header style={navStyle}>
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center gap-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 mr-auto hover:opacity-80 transition-opacity">
          <span className="text-sm font-semibold tracking-tight" style={textStyle}>ScholarChain</span>
          <span style={yellowBadge}>Testnet</span>
          {role && <span className="text-xs font-mono hidden sm:inline" style={mutedStyle}>/ {role}</span>}
        </button>

        <button onClick={toggle} className="transition-colors hover:opacity-100 opacity-60" style={textStyle} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {publicKey && (
          <>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono" style={mutedStyle}>{isLoadingBalance ? "..." : `${formatXLM(balance)} XLM`}</span>
              <button onClick={() => refreshBalance()} className="opacity-40 hover:opacity-80 transition-opacity" style={textStyle}><RefreshCw className="w-3 h-3" /></button>
            </div>
            <div className="h-3 w-px hidden sm:block" style={{ background: "var(--border)" }} />
            <span className="font-mono text-xs hidden sm:block" style={mutedStyle}>{shortAddress(publicKey)}</span>
            {parseFloat(balance) < 10 && (
              <button onClick={handleFund} disabled={funding}
                className="hidden sm:flex items-center h-7 px-3 text-xs font-semibold rounded-md transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{ background: "var(--yellow)", color: "#000" }}>
                {funded ? "Funded" : funding ? "..." : "Get Test XLM"}
              </button>
            )}
            <button onClick={handleDisconnect} className="opacity-40 hover:opacity-100 transition-opacity ml-1" style={textStyle} title="Disconnect">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
