import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { sendXLMTransaction, submitSignedTransaction, getExplorerUrl, formatXLM, NETWORK_PASSPHRASE } from "../utils/stellar";
import { signWithFreighter } from "../utils/freighter";

const STATES = { IDLE: "idle", BUILDING: "building", SIGNING: "signing", SUBMITTING: "submitting", SUCCESS: "success", ERROR: "error" };

const ERROR_MESSAGES = {
  INVALID_DESTINATION: "The destination address is invalid.",
  INVALID_AMOUNT: "Please enter a valid amount.",
  AMOUNT_TOO_LOW: "Minimum donation is 1 XLM.",
  INSUFFICIENT_BALANCE: "Your wallet doesn't have enough XLM.",
  USER_DECLINED_SIGN: "You cancelled the transaction. No funds were sent.",
  TX_BUILD_FAILED: "Could not build transaction. Please try again.",
  TX_SUBMIT_FAILED: "Transaction failed on-network. Please try again.",
  SIGN_FAILED: "Signing failed. Make sure Freighter is on Testnet.",
  BALANCE_TOO_LOW: "Balance too low to cover transaction + fees.",
};

export default function DonateModal({ scholarship, onClose }) {
  const { publicKey, refreshBalance, balance } = useWallet();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [txState, setTxState] = useState(STATES.IDLE);
  const [txHash, setTxHash] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDonate = async () => {
    if (!publicKey || !scholarship) return;
    setTxState(STATES.BUILDING);
    setErrorMsg("");

    try {
      // Build tx
      const { xdr } = await sendXLMTransaction(
        publicKey,
        scholarship.walletAddress,
        amount,
        message || `ScholarChain: ${scholarship.firstName}`
      );

      // Sign
      setTxState(STATES.SIGNING);
      const signedXDR = await signWithFreighter(xdr, NETWORK_PASSPHRASE);

      // Submit
      setTxState(STATES.SUBMITTING);
      const result = await submitSignedTransaction(signedXDR);

      setTxHash(result.hash);
      setTxState(STATES.SUCCESS);
      await refreshBalance();
    } catch (err) {
      setErrorMsg(ERROR_MESSAGES[err.message] || "Something went wrong. Please try again.");
      setTxState(STATES.ERROR);
    }
  };

  const isProcessing = [STATES.BUILDING, STATES.SIGNING, STATES.SUBMITTING].includes(txState);
  const quickAmounts = [10, 25, 50, 100];

  const stepLabel = {
    [STATES.BUILDING]: "Building transaction…",
    [STATES.SIGNING]: "Waiting for Freighter…",
    [STATES.SUBMITTING]: "Broadcasting to Stellar…",
  }[txState];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>✕</button>

        {txState !== STATES.SUCCESS ? (
          <>
            <div className="modal-header">
              <span className="modal-emoji">{scholarship.emoji}</span>
              <div>
                <h2 className="modal-title">Fund {scholarship.firstName}</h2>
                <p className="modal-subtitle">{scholarship.name} · {scholarship.field}</p>
              </div>
            </div>

            <div className="modal-balance-row">
              <span>Your balance</span>
              <span className="modal-balance">{formatXLM(balance)} XLM</span>
            </div>

            <label className="form-label">Donation amount (XLM)</label>
            <div className="quick-amounts">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  className={`quick-btn ${amount === String(q) ? "active" : ""}`}
                  onClick={() => setAmount(String(q))}
                  disabled={isProcessing}
                >
                  {q} XLM
                </button>
              ))}
            </div>
            <input
              className="form-input"
              type="number"
              min="1"
              step="0.1"
              placeholder="Or enter custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
            />

            <label className="form-label">Message (optional)</label>
            <input
              className="form-input"
              type="text"
              maxLength={28}
              placeholder="Good luck with your studies!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isProcessing}
            />

            <div className="modal-dest">
              <span>To wallet</span>
              <span className="dest-addr">{scholarship.walletAddress.slice(0, 10)}...{scholarship.walletAddress.slice(-6)}</span>
            </div>

            {txState === STATES.ERROR && (
              <div className="tx-error">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            {isProcessing && (
              <div className="tx-status">
                <span className="spinner" />
                <span>{stepLabel}</span>
              </div>
            )}

            <button
              className="btn-primary full"
              onClick={handleDonate}
              disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            >
              {isProcessing ? stepLabel : `Donate ${amount || "—"} XLM`}
            </button>
          </>
        ) : (
          <div className="tx-success">
            <div className="success-icon">🎉</div>
            <h2>Donation Sent!</h2>
            <p>You've helped fund <strong>{scholarship.firstName}</strong>'s education.</p>
            <div className="tx-hash-box">
              <span className="tx-hash-label">Transaction Hash</span>
              <code className="tx-hash">{txHash}</code>
              <a href={getExplorerUrl(txHash)} target="_blank" rel="noreferrer" className="btn-explorer">
                View on Stellar Explorer ↗
              </a>
            </div>
            <p className="success-note">This transaction is now permanently recorded on the Stellar testnet.</p>
            <button className="btn-primary full" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
