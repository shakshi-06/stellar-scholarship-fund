import { useWallet } from "../context/WalletContext";

export default function ScholarshipCard({ scholarship, onDonate, index }) {
  const { publicKey } = useWallet();
  const pct = Math.min(100, Math.round((scholarship.raised / scholarship.goal) * 100));
  const isAlt = index % 2 === 1;

  return (
    <div className="scard">
      <div className={`scard-accent ${isAlt ? "alt" : ""}`} />
      <div className="scard-body">
        <div className="scard-top">
          <span className="scard-field">{scholarship.field}</span>
          <span className="scard-days">{scholarship.daysLeft}d left</span>
        </div>
        <h3 className="scard-name">{scholarship.name}</h3>
        <p className="scard-desc">{scholarship.description}</p>
        <p className="scard-location">{scholarship.location}</p>
        <div className="scard-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress-labels">
            <span><strong>{scholarship.raised} XLM</strong> raised of {scholarship.goal} XLM</span>
            <span className="progress-pct">{pct}%</span>
          </div>
        </div>
      </div>
      <div className="scard-footer">
        <button
          className="btn-donate"
          onClick={() => onDonate(scholarship)}
          disabled={!publicKey}
          title={!publicKey ? "Connect wallet to donate" : ""}
        >
          {publicKey ? `Fund ${scholarship.firstName}` : "Connect Wallet to Fund"}
        </button>
      </div>
    </div>
  );
}
