import { useState } from "react";
import ScholarshipCard from "./ScholarshipCard";
import DonateModal from "./DonateModal";

const SCHOLARSHIPS = [
  {
    id: 1,
    name: "Priya Sharma Merit Scholarship",
    firstName: "Priya",
    description: "First-generation CS student from rural Rajasthan. Needs funding for laptop and hostel fees.",
    field: "Computer Science",
    location: "Jaipur, RJ",
    goal: 500,
    raised: 320,
    daysLeft: 12,
    emoji: "👩‍💻",
    color: "#FFB347",
    walletAddress: "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM",
  },
  {
    id: 2,
    name: "Arjun Mehta Engineering Grant",
    firstName: "Arjun",
    description: "Mechanical engineering student who lost family income. Excels at robotics competitions.",
    field: "Engineering",
    location: "Pune, MH",
    goal: 400,
    raised: 175,
    daysLeft: 8,
    emoji: "⚙️",
    color: "#90EE90",
    walletAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
  },
  {
    id: 3,
    name: "Meena Devi Medical Bursary",
    firstName: "Meena",
    description: "MBBS student and aspiring rural doctor. Scholarship covers exam fees and textbooks.",
    field: "Medicine",
    location: "Lucknow, UP",
    goal: 750,
    raised: 610,
    daysLeft: 5,
    emoji: "🩺",
    color: "#FFB6C1",
    walletAddress: "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM",
  },
  {
    id: 4,
    name: "Rohan Das Design Fellowship",
    firstName: "Rohan",
    description: "Self-taught UI designer from Kolkata, accepted to NID. Needs software subscriptions and materials.",
    field: "Design",
    location: "Kolkata, WB",
    goal: 300,
    raised: 88,
    daysLeft: 20,
    emoji: "🎨",
    color: "#DDA0DD",
    walletAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
  },
  {
    id: 5,
    name: "Fatima Khan Science Award",
    firstName: "Fatima",
    description: "Physics researcher with two published papers. Funding needed for international conference travel.",
    field: "Physics",
    location: "Hyderabad, TS",
    goal: 600,
    raised: 390,
    daysLeft: 15,
    emoji: "🔬",
    color: "#87CEEB",
    walletAddress: "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM",
  },
  {
    id: 6,
    name: "Kabir Singh Law Scholarship",
    firstName: "Kabir",
    description: "Law student focusing on digital rights. Moot court champion seeking LLM tuition support.",
    field: "Law",
    location: "Delhi, DL",
    goal: 450,
    raised: 210,
    daysLeft: 18,
    emoji: "⚖️",
    color: "#F4A460",
    walletAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
  },
];

const FIELDS = ["All", ...new Set(SCHOLARSHIPS.map((s) => s.field))];

export default function ScholarshipList() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? SCHOLARSHIPS : SCHOLARSHIPS.filter((s) => s.field === filter);

  return (
    <section className="scholarships" id="scholarships">
      <div className="section-inner">
        <div className="section-header">
          <h2 className="section-title">Active Scholarships</h2>
          <p className="section-sub">Each fund is held on the Stellar testnet. Donations go directly to student wallets.</p>
        </div>
        <div className="filter-tabs">
          {FIELDS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="scholarships-grid">
          {filtered.map((s) => (
            <ScholarshipCard key={s.id} scholarship={s} onDonate={setSelected} />
          ))}
        </div>
      </div>
      {selected && (
        <DonateModal scholarship={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
