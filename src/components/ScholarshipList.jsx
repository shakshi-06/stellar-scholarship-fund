import { useState } from "react";
import ScholarshipCard from "./ScholarshipCard";
import DonateModal from "./DonateModal";

const DEMO_WALLET = "GDX2ILXF5EHCELK6KREHFGDFKPJMAH74FIATNESSVNKYD4LPPSAGZNGL";

const SCHOLARSHIPS = [
  {
    id: 1,
    name: "Ananya Singh — National Merit in Computer Science",
    firstName: "Ananya",
    description: "First-generation student from Varanasi pursuing B.Tech CSE. Scholarship covers hostel fees, textbooks, and a laptop for her final two years.",
    field: "Computer Science",
    location: "Varanasi, UP",
    goal: 500, raised: 320, daysLeft: 12,
    walletAddress: DEMO_WALLET,
  },
  {
    id: 2,
    name: "Rajan Verma — Excellence in Engineering Award",
    firstName: "Rajan",
    description: "Mechanical engineering student from Nagpur who lost his father to illness last year. Ranked 3rd in his cohort despite financial hardship.",
    field: "Engineering",
    location: "Nagpur, MH",
    goal: 400, raised: 175, daysLeft: 8,
    walletAddress: DEMO_WALLET,
  },
  {
    id: 3,
    name: "Sunita Devi — Rural Healthcare Initiative Grant",
    firstName: "Sunita",
    description: "MBBS student and daughter of a daily-wage farmer from Bihar. Aspires to establish a free clinic in her village after graduating.",
    field: "Medicine",
    location: "Patna, BR",
    goal: 750, raised: 610, daysLeft: 5,
    walletAddress: DEMO_WALLET,
  },
  {
    id: 4,
    name: "Arjun Das — Institute of Design Access Fellowship",
    firstName: "Arjun",
    description: "Self-taught UI designer accepted into NID Ahmedabad. Funding needed for course materials, software licences, and relocation from Kolkata.",
    field: "Design",
    location: "Kolkata, WB",
    goal: 300, raised: 88, daysLeft: 20,
    walletAddress: DEMO_WALLET,
  },
  {
    id: 5,
    name: "Noor Fatima — STEM Research Travel Bursary",
    firstName: "Noor",
    description: "Physics postgraduate with two published papers on quantum optics. Grant covers travel and accommodation for the IEEE Asia-Pacific Conference.",
    field: "Physics",
    location: "Hyderabad, TS",
    goal: 600, raised: 390, daysLeft: 15,
    walletAddress: DEMO_WALLET,
  },
  {
    id: 6,
    name: "Vikram Nair — Public Interest Law Scholarship",
    firstName: "Vikram",
    description: "Law student specialising in digital rights and data privacy. Two-time national moot court finalist seeking support for his LLM at NLSIU.",
    field: "Law",
    location: "Bengaluru, KA",
    goal: 450, raised: 210, daysLeft: 18,
    walletAddress: DEMO_WALLET,
  },
];

const FIELDS = ["All", ...new Set(SCHOLARSHIPS.map((s) => s.field))];

export default function ScholarshipList() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? SCHOLARSHIPS
    : SCHOLARSHIPS.filter((s) => s.field === filter);

  return (
    <section className="scholarships" id="scholarships">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Active Scholarships</h2>
          <p className="section-sub">Donations go directly to student wallets on Stellar Testnet. Every transaction is verifiable on-chain.</p>
        </div>
        <div className="filter-tabs">
          {FIELDS.map((f) => (
            <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="scholarships-grid">
          {filtered.map((s, i) => (
            <ScholarshipCard key={s.id} scholarship={s} onDonate={setSelected} index={i} />
          ))}
        </div>
      </div>
      {selected && <DonateModal scholarship={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
