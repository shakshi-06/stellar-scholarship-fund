import { useState, useEffect, useRef } from "react";
import { server, shortAddress } from "../utils/stellar";
import { SC_MEMO } from "../context/AppContext";

const TREASURY_SAMPLE = "GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL";

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
          .forAccount(TREASURY_SAMPLE)
          .limit(10)
          .order("desc")
          .call();
        if (!mountedRef.current) return;
        const filtered = result.records
          .filter(p => p.type === "payment" && p.asset_type === "native")
          .map(p => ({
            id: p.id,
            from: shortAddress(p.from),
            to: shortAddress(p.to),
            amount: parseFloat(p.amount).toFixed(1),
            time: p.created_at,
            direction: p.to === TREASURY_SAMPLE ? "in" : "out",
          }));
        setEvents(filtered);
        setLive(true);
      } catch {
        setLive(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => { mountedRef.current = false; clearInterval(interval); };
  }, []);

  if (events.length === 0) return null;

  const doubled = [...events, ...events];

  return (
    <div className="border-y border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden py-3 relative">
      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 bg-[#0d0d0d] pr-3">
        <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-400" : "bg-[#333]"}`} />
        <span className="text-[10px] font-mono text-[#333] uppercase tracking-widest">Live</span>
      </div>

      {/* Scrolling track */}
      <div className="flex" style={{ animation: "stripScroll 30s linear infinite", width: "max-content", paddingLeft: "100px" }}>
        {doubled.map((ev, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-[#1a1a1a] flex-shrink-0">
            <span className={`text-xs font-mono ${ev.direction === "in" ? "text-green-400" : "text-[#f2d94e]"}`}>
              {ev.direction === "in" ? "+" : "-"}{ev.amount} XLM
            </span>
            <span className="text-xs font-mono text-[#333]">
              {ev.direction === "in" ? `from ${ev.from}` : `to ${ev.to}`}
            </span>
            <span className="text-xs font-mono text-[#222]">{timeAgo(ev.time)}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes stripScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
