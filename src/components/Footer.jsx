export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--footer-bg)]">
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text)]">ScholarChain</span>
          <span className="text-xs font-mono text-[var(--text-dim)]">/ Stellar Testnet</span>
        </div>
        <div className="flex items-center gap-5 text-xs font-mono text-[var(--text-dim)]">
          <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors">stellar.org</a>
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors">Explorer</a>
          <a href="https://www.freighter.app" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition-colors">Freighter</a>
        </div>
        <p className="text-xs text-[var(--text-dim)] font-mono">All transactions on Testnet</p>
      </div>
    </footer>
  );
}
