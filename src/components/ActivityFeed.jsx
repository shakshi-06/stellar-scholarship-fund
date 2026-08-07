import { useEffect, useState, useRef } from "react";
import { server, shortAddress } from "../utils/stellar";

// Polls Horizon for recent payments to the demo wallet and shows them as live feed
const DEMO_WALLET = "GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL";
const POLL_INTERVAL = 8000;

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function ActivityFeed() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("connecting");
  const cursorRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchPayments = async () => {
    try {
      let builder = server.payments().forAccount(DEMO_WALLET).limit(5).order("desc");
      const payments = await builder.call();

      if (!mountedRef.current) return;

      const newEvents = payments.records
        .filter((p) => p.type === "payment" && p.asset_type === "native")
        .map((p) => ({
          id: p.id,
          from: shortAddress(p.from),
          amount: parseFloat(p.amount).toFixed(2),
          time: p.created_at,
          hash: p.transaction_hash,
        }));

      setEvents(newEvents);
      setStatus("live");
    } catch {
      if (mountedRef.current) setStatus("error");
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchPayments();
    const interval = setInterval(fetchPayments, POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="activity-feed" id="activity">
      <div className="container">
        <div className="af-header">
          <div>
            <h2 className="section-title">Live Activity</h2>
            <p className="section-sub">Real-time donation events streaming from Stellar Testnet.</p>
          </div>
          <div className={`af-status af-status--${status}`}>
            <span className="af-dot" />
            {status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Reconnecting"}
          </div>
        </div>

        <div className="af-feed">
          {events.length === 0 ? (
            <div className="af-empty">
              {status === "connecting" ? (
                <><span className="spinner" /> Fetching on-chain events</>
              ) : (
                "No recent transactions found. Make a donation to see it appear here."
              )}
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="af-event">
                <div className="af-event-left">
                  <div className="af-icon">XLM</div>
                  <div>
                    <div className="af-event-title">
                      <strong>{ev.amount} XLM</strong> received from {ev.from}
                    </div>
                    <div className="af-event-sub">
                      Tx: <a
                        href={`https://stellar.expert/explorer/testnet/tx/${ev.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="af-hash"
                      >
                        {ev.hash.slice(0, 12)}...
                      </a>
                    </div>
                  </div>
                </div>
                <div className="af-event-time">{timeAgo(ev.time)}</div>
              </div>
            ))
          )}
        </div>

        <p className="af-note">
          This feed polls Stellar Horizon every 8 seconds and displays incoming payments in real time.
          Each entry links directly to the transaction on Stellar Expert.
        </p>
      </div>
    </section>
  );
}
