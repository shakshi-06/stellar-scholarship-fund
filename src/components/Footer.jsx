export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">ScholarChain</span>
        </div>
        <p className="footer-note">
          Built on Stellar Testnet · <a href="https://stellar.org" target="_blank" rel="noreferrer">stellar.org</a> ·{" "}
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer">Explorer</a>
        </p>
        <p className="footer-disclaimer">
          This is a demo dApp built for the Stellar Journey to Mastery competition. All transactions are on the Stellar Testnet.
        </p>
      </div>
    </footer>
  );
}
