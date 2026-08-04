import { useWallet } from "../context/WalletContext";

export default function Hero() {
  const { publicKey, connect, isConnecting } = useWallet();

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-label">
          <span className="hero-dot" />
          Live on Stellar Testnet
        </div>

        <h1 className="hero-headline">
          Education that <em>no one</em><br />can take away.
        </h1>

        <p className="hero-sub">
          ScholarChain puts scholarship funds directly on-chain. Every donation
          is tracked on the Stellar ledger and paid straight to the student
          wallet. No middlemen, no paperwork.
        </p>

        <div className="hero-cta">
          {!publicKey ? (
            <button className="btn-peach" onClick={connect} disabled={isConnecting}>
              {isConnecting ? <><span className="spinner-sm" /> Connecting</> : "Connect Wallet"}
            </button>
          ) : (
            <a href="#scholarships" className="btn-peach">Browse Scholarships</a>
          )}
          <a href="#how" className="btn-outline-white">How It Works</a>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">38</span>
            <span className="stat-lbl">Students Funded</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">6</span>
            <span className="stat-lbl">Active Funds</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">100%</span>
            <span className="stat-lbl">On-Chain</span>
          </div>
        </div>
      </div>
    </section>
  );
}
