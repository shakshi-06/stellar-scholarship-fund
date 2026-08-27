import { useApp } from "../context/AppContext";
import { useWallet } from "../context/WalletContext";
import { ArrowLeft, Clock, MapPin, User, ExternalLink } from "lucide-react";

function timeLeft(exp) {
  const d = new Date(exp).getTime() - Date.now();
  if (d <= 0) return "Expired";
  const days = Math.floor(d / 86400000);
  const hrs = Math.floor((d % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hrs}h left`;
  return `${hrs}h ${Math.floor((d % 3600000) / 60000)}m left`;
}

function timeAgo(s) {
  const d = Math.floor((Date.now() - new Date(s).getTime()) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function RequestDetail({ request, onBack, onFund }) {
  const { getDonationsForRequest } = useApp();
  const { publicKey } = useWallet();

  if (!request) return null;

  const pct = Math.min(100, Math.round((request.raised / request.goalXLM) * 100));
  const remaining = Math.max(0, request.goalXLM - request.raised);
  const expired = new Date(request.expiresAt) < new Date();
  const full = pct >= 100;
  const donations = getDonationsForRequest(request.id);
  const isOwnRequest = request.studentWallet === publicKey;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back button */}
      <button onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", marginBottom: 28, padding: 0 }}>
        <ArrowLeft size={15} /> Back to Browse
      </button>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px" }}>
            {request.field}
          </span>
          {!expired && (
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 4, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} /> {timeLeft(request.expiresAt)}
            </span>
          )}
          {expired && (
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "2px 8px" }}>
              Expired
            </span>
          )}
          {full && (
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 4, padding: "2px 8px" }}>
              Fully Funded
            </span>
          )}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.3 }}>
          {request.purpose}
        </h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-dim)", fontFamily: "monospace" }}>
            <MapPin size={12} /> {request.location}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-dim)", fontFamily: "monospace" }}>
            <User size={12} /> {request.studentWallet?.slice(0, 8)}...{request.studentWallet?.slice(-6)}
          </div>
        </div>
      </div>

      {/* Story */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
          Student's Story
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8 }}>{request.description}</p>
      </div>

      {/* Funding progress */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Funding Progress
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "monospace", color: "var(--yellow)" }}>{request.raised} XLM</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>raised of {request.goalXLM} XLM goal</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: "monospace", color: "var(--text)" }}>{pct}%</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{request.donorCount} donor{request.donorCount !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div style={{ background: "var(--surface-2)", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--yellow)", borderRadius: 4, transition: "width 0.5s" }} />
        </div>
        {!full && !expired && (
          <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-dim)" }}>
            {remaining.toFixed(2)} XLM still needed
          </div>
        )}
      </div>

      {/* Donation history from local state */}
      {donations.length > 0 && (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Donations ({donations.length})
          </div>
          {donations.map(d => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)" }}>{d.from?.slice(0, 8)}...{d.from?.slice(-6)}</div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-dim)", marginTop: 2 }}>{timeAgo(d.time)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: "var(--yellow)" }}>{d.amount} XLM</span>
                <a href={`https://stellar.expert/explorer/testnet/tx/${d.txHash}`} target="_blank" rel="noreferrer"
                  style={{ color: "var(--text-dim)", display: "flex" }}>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fund button */}
      {!isOwnRequest && (
        <button
          onClick={() => !expired && !full && onFund(request)}
          disabled={expired || full}
          style={{ width: "100%", height: 44, fontSize: 14, fontWeight: 600, background: expired || full ? "var(--surface-2)" : "var(--text)", color: expired || full ? "var(--text-dim)" : "var(--bg)", border: expired || full ? "1px solid var(--border-2)" : "none", borderRadius: 10, cursor: expired || full ? "not-allowed" : "pointer", opacity: expired || full ? 0.5 : 1 }}>
          {full ? "Fully Funded" : expired ? "Expired" : `Fund this student — ${remaining.toFixed(2)} XLM needed`}
        </button>
      )}

      {isOwnRequest && (
        <div style={{ textAlign: "center", fontSize: 12, fontFamily: "monospace", color: "var(--text-dim)", padding: "12px 0" }}>
          This is your request. Switch to donor portal to fund other students.
        </div>
      )}
    </div>
  );
}
