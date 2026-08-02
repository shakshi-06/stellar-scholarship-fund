const STEPS = [
  { icon: "🔗", title: "Connect Wallet", desc: "Link your Freighter wallet in one click. We only read your public key — your funds stay yours." },
  { icon: "🎓", title: "Choose a Scholar", desc: "Browse verified students. Each profile shows their story, goal, and real-time XLM raised." },
  { icon: "💸", title: "Send XLM", desc: "Enter an amount, sign with Freighter, and your donation goes directly to the student's Stellar wallet." },
  { icon: "🔍", title: "Track On-Chain", desc: "Every transaction is public on Stellar Explorer. Full accountability, zero hidden fees." },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how">
      <div className="section-inner">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">From wallet to student in under 30 seconds.</p>
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{String(i + 1).padStart(2, "0")}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
