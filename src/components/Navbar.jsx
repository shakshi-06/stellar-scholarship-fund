import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { shortAddress, formatXLM } from "../utils/stellar";

export default function Navbar() {
  const { publicKey, balance, isConnecting, isLoadingBalance, connect, disconnect, freighterInstalled, walletError } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">🎓</div>
          <span className="brand-name">ScholarChain</span>
          <span className="brand-badge">Testnet</span>
        </div>

        <div className="navbar-links desktop-only">
          <a href="#scholarships">Scholarships</a>
          <a href="#donate">Donate</a>
          <a href="#how">How It Works</a>
        </div>

        <div className="navbar-actions desktop-only">
          {!publicKey ? (
            <button
              className="btn-connect"
              onClick={connect}
              disabled={isConnecting || freighterInstalled === false}
              title={freighterInstalled === false ? "Install Freighter wallet first" : ""}
            >
              {isConnecting ? (
                <span className="spinner-sm" />
              ) : freighterInstalled === false ? (
                "Install Freighter"
              ) : (
                "Connect Wallet"
              )}
            </button>
          ) : (
            <div className="wallet-pill">
              <div className="wallet-info">
                <span className="wallet-addr">{shortAddress(publicKey)}</span>
                <span className="wallet-balance">
                  {isLoadingBalance ? "..." : `${formatXLM(balance)} XLM`}
                </span>
              </div>
              <button className="btn-disconnect" onClick={disconnect} title="Disconnect">✕</button>
            </div>
          )}
        </div>

        <button className="hamburger mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <a href="#scholarships" onClick={() => setMenuOpen(false)}>Scholarships</a>
          <a href="#donate" onClick={() => setMenuOpen(false)}>Donate</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
          {!publicKey ? (
            <button className="btn-connect" onClick={() => { connect(); setMenuOpen(false); }} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="mobile-wallet">
              <span>{shortAddress(publicKey)}</span>
              <span>{formatXLM(balance)} XLM</span>
              <button onClick={() => { disconnect(); setMenuOpen(false); }}>Disconnect</button>
            </div>
          )}
        </div>
      )}

      {walletError && (
        <div className="navbar-error">
          {walletError === "FREIGHTER_NOT_INSTALLED" && (
            <>Freighter not found. <a href="https://www.freighter.app" target="_blank" rel="noreferrer">Install it here →</a></>
          )}
          {walletError === "USER_DECLINED" && "Connection cancelled."}
          {walletError === "CONNECTION_FAILED" && "Could not connect. Try again."}
        </div>
      )}
    </nav>
  );
}
