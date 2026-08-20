import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyHash({ hash, label = "Transaction Hash" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      const el = document.createElement("textarea");
      el.value = hash;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 12px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:10, fontFamily:"monospace", color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
          {label}
        </span>
        <button onClick={handleCopy}
          style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontFamily:"monospace", color:copied?"#4ade80":"var(--text-dim)", background:"none", border:"none", cursor:"pointer" }}>
          {copied ? <><Check size={11} style={{ color:"#4ade80" }}/>Copied</> : <><Copy size={11}/>Copy</>}
        </button>
      </div>
      <div style={{ fontFamily:"monospace", fontSize:11, color:"var(--text-muted)", wordBreak:"break-all", lineHeight:1.5 }}>{hash}</div>
    </div>
  );
}
