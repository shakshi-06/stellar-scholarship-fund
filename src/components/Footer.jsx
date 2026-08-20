export default function Footer() {
  return (
    <footer style={{ borderTop:"1px solid var(--border)", background:"var(--footer-bg)", padding:"20px 24px" }}>
      <div style={{ maxWidth:1024,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:14,fontWeight:600,color:"var(--text)" }}>ScholarChain</span>
          <span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>/ Stellar Testnet</span>
        </div>
        <div style={{ display:"flex",gap:20 }}>
          {[["stellar.org","https://stellar.org"],["Explorer","https://stellar.expert/explorer/testnet"],["Freighter","https://www.freighter.app"]].map(([l,h])=>(
            <a key={l} href={h} target="_blank" rel="noreferrer" style={{ fontSize:12,fontFamily:"monospace",color:"var(--text-dim)",textDecoration:"none" }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize:11,fontFamily:"monospace",color:"var(--text-dim)" }}>All transactions on Testnet</span>
      </div>
    </footer>
  );
}
