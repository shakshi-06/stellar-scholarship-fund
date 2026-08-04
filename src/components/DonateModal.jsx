import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { sendXLMTransaction, submitSignedTransaction, getExplorerUrl, formatXLM } from "../utils/stellar";
import { signWithFreighter } from "../utils/freighter";

const STATES = { IDLE: "idle", BUILDING: "building", SIGNING: "signing", SUBMITTING: "submitting", SUCCESS: "success", ERROR: "error" };

const ERROR_MESSAGES = {
  INVALID_DESTINATION: "The destination address is invalid.",
  INVALID_AMOUNT: "Please enter a valid amount.",
  AMOUNT_TOO_LOW: "Minimum donation is 1 XLM.",
  INSUFFICIENT_BALANCE: "Not enough XLM. Click Get Test XLM in your wallet panel first.",
  USER_DECLINED_SIGN: "You cancelled the transaction in Freighter. No funds were sent.",
  TX_BUILD_FAILED: "Could not build transaction. Please try again.",
  TX_SUBMIT_FAILED: "Transaction failed on-network. Please try again.",
  SIGN_FAILED: "Signing failed. Make sure Freighter is set to Testnet.",
  ACCOUNT_NOT_FOUND: "Account not funded yet. Click Get Test XLM first.",
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
      const { xdr } = await sendXLMTransaction(
        publicKey,
        scholarship.walletAddress,
        amount,
        message || `ScholarChain: ${scholarship.firstName}`
      );
      setTxState(STATES.SIGNING);
      const signedXDR = await signWithFreighter(xdr, publicKey);
      setTxState(STATES.SUBMITTING);
      const result = await submitSignedTransaction(signedXDR);
      setTxHash(result.hash);
      setTxState(STATES.SUCCESS);
      await refreshBalance();
    } catch (err) {
      setErrorMsg(ERROR_MESSAGES[err.message] || `Error: ${err.message}`);
      setTxState(STATES.ERROR);
    }
  };

  const isProcessing = [STATES.BUILDING, STATES.SIGNING, STATES.SUBMITTING].includes(txState);
  const quickAmounts = [10, 25, 50, 100];
  const stepLabel = {
    [STATES.BUILDING]: "Building transaction...",
    [STATES.SIGNING]: "Check Freighter popup...",
    [STATES.SUBMITTING]: "Broadcasting to Stellar...",
  }[txState];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>x</button>

        {txState !== STATES.SUCCESS ? (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Fund {scholarship.firstName}</h2>
              <p className="modal-subtitle">{scholarship.name} · {scholarship.field}</p>
            </div>

            <div className="modal-balance-row">
              <span>Your balance</span>
              <span className="modal-balance">{formatXLM(balance)} XLM</span>
            </div>

            <label className="form-label">Amount (XLM)</label>
            <div className="quick-amounts">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  className={`quick-btn ${amount === String(q) ? "active" : ""}`}
                  onClick={() => setAmount(String(q))}
                  disabled={isProcessing}
                >
                  {q}
                </button>
              ))}
            </div>
            <input
              className="form-input"
              type="number"
              min="1"
              step="1"
              placeholder="Custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
            />

            <label className="form-label">Message (optional)</label>
            <input
              className="form-input"
              type="text"
              maxLength={28}
              placeholder="Good luck with your studies"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isProcessing}
            />

            <div className="modal-dest">
              <span>To</span>
              <span className="dest-addr">{scholarship.walletAddress.slice(0, 10)}...{scholarship.walletAddress.slice(-6)}</span>
            </div>

            {txState === STATES.ERROR && (
              <div className="tx-error">{errorMsg}</div>
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
              disabled={isProcessing || !amount || parseFloat(amount) < 1}
              style={{ marginTop: "14px" }}
            >
              {isProcessing ? stepLabel : `Donate ${amount ? amount + " XLM" : ""}`}
            </button>
          </>
        ) : (
          <div className="tx-success">
            <div className="success-icon">+</div>
            <h2>Donation Sent</h2>
            <p>You have funded <strong>{scholarship.firstName}</strong>.</p>
            <div className="tx-hash-box">
              <span className="tx-hash-label">Transaction Hash</span>
              <code className="tx-hash">{txHash}</code>
              <a href={getExplorerUrl(txHash)} target="_blank" rel="noreferrer" className="btn-explorer">
                View on Stellar Explorer
              </a>
            </div>
            <p className="success-note">This transaction is permanently recorded on the Stellar testnet.</p>
            <button className="btn-primary full" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
