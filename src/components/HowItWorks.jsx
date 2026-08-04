const STEPS = [
  {
    num: "01",
    title: "Connect Wallet",
    desc: "Link your Freighter wallet in one click. We only read your public key. Your funds stay in your control at all times.",
  },
  {
    num: "02",
    title: "Choose a Scholar",
    desc: "Browse verified students. Each profile shows their background, funding goal, and how much has been raised on-chain.",
  },
  {
    num: "03",
    title: "Send XLM",
    desc: "Enter an amount, sign with Freighter, and your donation goes directly to the student's Stellar testnet wallet.",
  },
  {
    num: "04",
    title: "Track On-Chain",
    desc: "Every transaction is public on Stellar Explorer. Full accountability, permanent record, zero hidden fees.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">From wallet to student in under 30 seconds.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map((step) => (
            <div key={step.num} className="step-card">
              <span className="step-num-tag">{step.num}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
