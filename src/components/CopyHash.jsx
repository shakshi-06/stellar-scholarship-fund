import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyHash({ hash, label = "Transaction Hash" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = hash;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[var(--bg)] rounded-lg p-3 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs font-mono text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
          title="Copy to clipboard"
        >
          {copied
            ? <><Check className="w-3 h-3 text-green-500" /><span className="text-green-500">Copied</span></>
            : <><Copy className="w-3 h-3" />Copy</>
          }
        </button>
      </div>
      <div className="font-mono text-xs text-[var(--text-muted)] break-all leading-relaxed">{hash}</div>
    </div>
  );
}
