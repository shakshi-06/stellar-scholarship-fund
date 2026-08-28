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
    try { await fundTestnetAccount(publicKey); await refreshBalance(); setFunded(true); setTimeout(()=>setFunded(false),3000); }
    catch {}
    finally { setFunding(false); }
  };

  return (
    <header style={{ position:"sticky",top:0,zIndex:50,borderBottom:"1px solid var(--border)",background:"var(--nav-bg)",backdropFilter:"blur(16px)" }}>
      <div style={{ maxWidth:1080,margin:"0 auto",padding:"0 24px",height:52,display:"flex",alignItems:"center",gap:16 }}>
        <button onClick={()=>navigate("/")} style={{ display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",marginRight:"auto" }}>
          <span style={{ fontSize:15,fontWeight:700,color:"var(--text)",letterSpacing:"-0.03em",fontFamily:"Inter,sans-serif" }}>ScholarChain</span>
          <span style={{ fontSize:9,fontFamily:"monospace",fontWeight:600,background:"var(--yellow-bg)",color:"var(--yellow)",border:"1px solid var(--yellow-border)",padding:"2px 7px",borderRadius:99,textTransform:"uppercase",letterSpacing:"0.1em" }}>Testnet</span>
          {role&&<span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>/ {role}</span>}
        </button>

        <button onClick={toggle} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-dim)",display:"flex",alignItems:"center",padding:4 }} title={theme==="dark"?"Light mode":"Dark mode"}>
          {theme==="dark"?<Sun size={14}/>:<Moon size={14}/>}
        </button>

        {publicKey&&(
          <>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>{isLoadingBalance?"...":formatXLM(balance)+" XLM"}</span>
              <button onClick={()=>refreshBalance()} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-dim)",display:"flex",opacity:0.6 }}><RefreshCw size={11}/></button>
            </div>
            <div style={{ width:1,height:14,background:"var(--border)" }}/>
            <span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>{shortAddress(publicKey)}</span>
            {parseFloat(balance)<10&&(
              <button onClick={handleFund} disabled={funding}
                style={{ height:30,padding:"0 14px",fontSize:11,fontWeight:600,background:"var(--yellow)",color:"#000",border:"none",borderRadius:8,cursor:"pointer",opacity:funding?0.6:1,letterSpacing:"0.01em" }}>
                {funded?"Funded":funding?"...":"Get Test XLM"}
              </button>
            )}
            <button onClick={()=>{ disconnect(); navigate("/"); }} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-dim)",display:"flex",alignItems:"center",opacity:0.7 }} title="Disconnect">
              <LogOut size={14}/>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
