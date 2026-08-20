import { useState, useEffect, useRef } from "react";
import { server, shortAddress } from "../utils/stellar";

const SAMPLE = "GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL";

function timeAgo(s) {
  const d = Math.floor((Date.now()-new Date(s).getTime())/1000);
  if (d<60) return `${d}s ago`;
  if (d<3600) return `${Math.floor(d/60)}m ago`;
  return `${Math.floor(d/3600)}h ago`;
}

export default function ActivityStrip() {
  const [events, setEvents] = useState([]);
  const [live, setLive] = useState(false);
  const ref = useRef(true);

  useEffect(() => {
    ref.current = true;
    const fetch = async () => {
      try {
        const r = await server.payments().forAccount(SAMPLE).limit(10).order("desc").call();
        if (!ref.current) return;
        setEvents(r.records.filter(p=>p.type==="payment"&&p.asset_type==="native")
          .map(p=>({ id:p.id, from:shortAddress(p.from), to:shortAddress(p.to), amount:parseFloat(p.amount).toFixed(1), time:p.created_at, dir:p.to===SAMPLE?"in":"out" })));
        setLive(true);
      } catch { setLive(false); }
    };
    fetch();
    const iv = setInterval(fetch, 10000);
    return () => { ref.current=false; clearInterval(iv); };
  }, []);

  if (events.length === 0) return null;
  const doubled = [...events, ...events];

  return (
    <div style={{ borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", background:"var(--surface)", overflow:"hidden", padding:"10px 0", position:"relative" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, display:"flex", alignItems:"center", paddingLeft:16, paddingRight:12, background:"var(--surface)", zIndex:1 }}>
        <span style={{ width:6, height:6, borderRadius:"50%", background:live?"#4ade80":"var(--border-2)", display:"inline-block", marginRight:6 }}/>
        <span style={{ fontSize:10, fontFamily:"monospace", color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.1em" }}>Live</span>
      </div>
      <div style={{ display:"flex", width:"max-content", paddingLeft:80, animation:"stripScroll 30s linear infinite" }}>
        {doubled.map((ev,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"0 20px", borderRight:"1px solid var(--border)", flexShrink:0 }}>
            <span style={{ fontSize:12, fontFamily:"monospace", color:ev.dir==="in"?"#4ade80":"var(--yellow)" }}>
              {ev.dir==="in"?"+":"-"}{ev.amount} XLM
            </span>
            <span style={{ fontSize:11, fontFamily:"monospace", color:"var(--text-dim)" }}>
              {ev.dir==="in"?`from ${ev.from}`:`to ${ev.to}`}
            </span>
            <span style={{ fontSize:11, fontFamily:"monospace", color:"var(--border-2)" }}>{timeAgo(ev.time)}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes stripScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
