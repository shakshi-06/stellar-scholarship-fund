import { useWallet } from "../context/WalletContext";

export default function ScholarshipCard({ scholarship, onDonate }) {
  const { publicKey } = useWallet();
  const pct = Math.min(100, Math.round((scholarship.raised / scholarship.goal) * 100));

  return (
    <div className="scard">
      <div className="scard-header">
        <div className="scard-badge" style={{ background: scholarship.color }}>
          {scholarship.field}
        </div>
        <div className="scard-urgency">{scholarship.daysLeft}d left</div>
      </div>
      <div className="scard-avatar">
        <span className="scard-emoji">{scholarship.emoji}</span>
      </div>
      <h3 className="scard-name">{scholarship.name}</h3>
      <p className="scard-desc">{scholarship.description}</p>
      <div className="scard-meta">
        <span>📍 {scholarship.location}</span>
        <span>🎯 {scholarship.goal} XLM goal</span>
      </div>
      <div className="scard-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-labels">
          <span>{scholarship.raised} XLM raised</span>
          <span>{pct}%</span>
        </div>
      </div>
      <button
        className="btn-donate"
        onClick={() => onDonate(scholarship)}
        disabled={!publicKey}
        title={!publicKey ? "Connect wallet to donate" : ""}
      >
        {publicKey ? `Fund ${scholarship.firstName}` : "Connect to Fund"}
      </button>
    </div>
  );
}
