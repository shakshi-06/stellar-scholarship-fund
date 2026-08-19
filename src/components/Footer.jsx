export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--footer-bg)" }}>
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>ScholarChain</span>
          <span className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>/ Stellar Testnet</span>
        </div>
        <div className="flex items-center gap-5 text-xs font-mono" style={{ color: "var(--text-dim)" }}>
          <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:opacity-100 opacity-60 transition-opacity" style={{ color: "var(--text-muted)" }}>stellar.org</a>
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:opacity-100 opacity-60 transition-opacity" style={{ color: "var(--text-muted)" }}>Explorer</a>
          <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="hover:opacity-100 opacity-60 transition-opacity" style={{ color: "var(--text-muted)" }}>Freighter</a>
        </div>
        <p className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>All transactions on Testnet</p>
      </div>
    </footer>
  );
}
