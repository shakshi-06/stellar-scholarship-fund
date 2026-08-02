import { useWallet } from "../context/WalletContext";

const STATS = [
  { value: "₹2.4L+", label: "Disbursed on-chain" },
  { value: "38", label: "Students funded" },
  { value: "100%", label: "Transparent" },
];

export default function Hero() {
  const { publicKey, connect, isConnecting } = useWallet();

  return (
    <section className="hero">
      <div className="hero-bg-dots" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-eyebrow">Built on Stellar Testnet</div>
        <h1 className="hero-headline">
          Education that <br />
          <span className="hero-accent">no one can take away.</span>
        </h1>
        <p className="hero-sub">
          ScholarChain puts scholarship funds on-chain — every rupee donated is
          tracked, every student paid directly, no middlemen.
        </p>
        <div className="hero-cta">
          {!publicKey && (
            <button className="btn-primary" onClick={connect} disabled={isConnecting}>
              {isConnecting ? <><span className="spinner-sm" /> Connecting...</> : "Connect & Donate"}
            </button>
          )}
          <a href="#scholarships" className="btn-ghost">Browse Scholarships ↓</a>
        </div>
        <div className="hero-stats">
          {STATS.map((s) => (
            <div key={s.label} className="hero-stat">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-illustration" aria-hidden="true">
        <div className="float-card fc1">
          <span>✅</span>
          <span>Tx confirmed</span>
        </div>
        <div className="float-card fc2">
          <span>🎓</span>
          <span>Priya funded</span>
        </div>
        <div className="float-card fc3">
          <span>⛓️</span>
          <span>On Stellar</span>
        </div>
        <div className="orb orb1" />
        <div className="orb orb2" />
      </div>
    </section>
  );
}
