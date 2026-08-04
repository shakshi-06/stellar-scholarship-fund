import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { formatXLM, fundTestnetAccount } from "../utils/stellar";

export default function WalletPanel() {
  const { publicKey, balance, isLoadingBalance, refreshBalance } = useWallet();
  const [funding, setFunding] = useState(false);
  const [fundMsg, setFundMsg] = useState(null);

  if (!publicKey) return null;

  const handleFund = async () => {
    setFunding(true);
    setFundMsg(null);
    try {
      await fundTestnetAccount(publicKey);
      await refreshBalance();
      setFundMsg({ type: "success", text: "10,000 XLM test tokens added to your wallet." });
    } catch {
      setFundMsg({ type: "error", text: "Funding failed. Your account may already be funded." });
    } finally {
      setFunding(false);
    }
  };

  return (
    <section className="wallet-panel" id="donate">
      <div className="wp-inner">
        <h2 className="wp-title">Your Wallet</h2>
        <div className="wp-card">
          <div className="wp-row">
            <span className="wp-label">Address</span>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
              target="_blank"
              rel="noreferrer"
              className="wp-addr"
            >
              {publicKey.slice(0, 14)}...{publicKey.slice(-8)}
            </a>
          </div>
          <div className="wp-row">
            <span className="wp-label">XLM Balance</span>
            <span className="wp-balance">
              {isLoadingBalance ? <span className="spinner-sm" /> : `${formatXLM(balance)} XLM`}
            </span>
          </div>
          <div className="wp-actions">
            <button className="btn-ghost-sm" onClick={() => refreshBalance()} disabled={isLoadingBalance}>
              Refresh
            </button>
            <button className="btn-ghost-sm" onClick={handleFund} disabled={funding}>
              {funding ? <><span className="spinner-sm" /> Funding</> : "Get Test XLM"}
            </button>
          </div>
          {fundMsg && <div className={`fund-msg ${fundMsg.type}`}>{fundMsg.text}</div>}
          <p className="wp-note">
            Need test XLM? Click Get Test XLM to receive 10,000 XLM from the Stellar Friendbot.
          </p>
        </div>
      </div>
    </section>
  );
}
