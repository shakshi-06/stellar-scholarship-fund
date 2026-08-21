import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

// Toast store — simple singleton so any component can trigger toasts
let addToastFn = null;

export const toast = {
  success: (msg) => addToastFn?.({ type: "success", msg }),
  error:   (msg) => addToastFn?.({ type: "error",   msg }),
  info:    (msg) => addToastFn?.({ type: "info",    msg }),
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback(({ type, msg }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { addToastFn = add; return () => { addToastFn = null; }; }, [add]);

  const icons = { success: CheckCircle2, error: XCircle, info: AlertCircle };
  const colors = {
    success: { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.25)", icon: "#4ade80" },
    error:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)",  icon: "#f87171" },
    info:    { bg: "var(--surface-2)",       border: "var(--border-2)",       icon: "var(--yellow)" },
  };

  return (
    <>
      {children}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:1000, display:"flex", flexDirection:"column", gap:8, maxWidth:340 }}>
        {toasts.map(t => {
          const Icon = icons[t.type];
          const c = colors[t.type];
          return (
            <div key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", borderRadius:10, background:c.bg, border:`1px solid ${c.border}`, backdropFilter:"blur(8px)", boxShadow:"0 8px 24px rgba(0,0,0,0.3)", animation:"slideIn 0.2s ease" }}>
              <Icon size={15} style={{ color:c.icon, flexShrink:0, marginTop:1 }} />
              <span style={{ fontSize:13, color:"var(--text)", lineHeight:1.5, flex:1 }}>{t.msg}</span>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-dim)", padding:0, display:"flex", marginTop:1 }}>
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </>
  );
}
