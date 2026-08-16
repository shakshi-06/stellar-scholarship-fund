import { useState, useEffect, useRef } from "react";
import { server, shortAddress } from "../utils/stellar";

const SAMPLE_WALLET = "GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function ActivityStrip() {
  const [events, setEvents] = useState([]);
  const [live, setLive] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const fetch = async () => {
      try {
        const result = await server.payments()
          .forAccount(SAMPLE_WALLET).limit(10).order("desc").call();
        if (!mountedRef.current) return;
        const filtered = result.records
          .filter(p => p.type === "payment" && p.asset_type === "native")
          .map(p => ({
            id: p.id,
            from: shortAddress(p.from),
            to: shortAddress(p.to),
            amount: parseFloat(p.amount).toFixed(1),
            time: p.created_at,
            direction: p.to === SAMPLE_WALLET ? "in" : "out",
          }));
        setEvents(filtered);
        setLive(true);
      } catch { setLive(false); }
    };
    fetch();
    const iv = setInterval(fetch, 10000);
    return () => { mountedRef.current = false; clearInterval(iv); };
  }, []);

  if (events.length === 0) return null;
  const doubled = [...events, ...events];

  return (
    <div className="border-y border-[var(--border)] bg-[var(--surface)] overflow-hidden py-3 relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 bg-[var(--surface)] pr-3">
        <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-500" : "bg-[var(--border-2)]"}`} />
        <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">Live</span>
      </div>
      <div className="flex" style={{ animation:"stripScroll 30s linear infinite", width:"max-content", paddingLeft:"80px" }}>
        {doubled.map((ev, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-[var(--border)] flex-shrink-0">
            <span className={`text-xs font-mono ${ev.direction==="in" ? "text-green-500" : "text-[var(--yellow)]"}`}>
              {ev.direction==="in" ? "+" : "-"}{ev.amount} XLM
            </span>
            <span className="text-xs font-mono text-[var(--text-dim)]">
              {ev.direction==="in" ? `from ${ev.from}` : `to ${ev.to}`}
            </span>
            <span className="text-xs font-mono text-[var(--border-2)]">{timeAgo(ev.time)}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes stripScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  );
}
