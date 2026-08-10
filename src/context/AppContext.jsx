import { createContext, useContext, useState, useCallback } from "react";

// In-memory store for scholarships and applications
// In production these would come from Soroban contract events
const INITIAL_POOLS = [
  {
    id: 1,
    title: "National Merit in Computer Science",
    field: "Computer Science",
    location: "Varanasi, UP",
    description: "For first-generation engineering students from rural Uttar Pradesh pursuing B.Tech CSE.",
    goal: 500,
    raised: 320,
    daysLeft: 12,
    providerWallet: null,
    applications: [],
  },
  {
    id: 2,
    title: "Excellence in Engineering Award",
    field: "Engineering",
    location: "Nagpur, MH",
    description: "Supporting mechanical engineering students facing financial hardship in Maharashtra.",
    goal: 400,
    raised: 175,
    daysLeft: 8,
    providerWallet: null,
    applications: [],
  },
  {
    id: 3,
    title: "Rural Healthcare Initiative Grant",
    field: "Medicine",
    location: "Patna, BR",
    description: "MBBS students from Bihar committed to serving rural communities after graduation.",
    goal: 750,
    raised: 610,
    daysLeft: 5,
    providerWallet: null,
    applications: [],
  },
  {
    id: 4,
    title: "Institute of Design Access Fellowship",
    field: "Design",
    location: "Kolkata, WB",
    description: "Supporting students accepted into premier design institutions who need relocation assistance.",
    goal: 300,
    raised: 88,
    daysLeft: 20,
    providerWallet: null,
    applications: [],
  },
  {
    id: 5,
    title: "STEM Research Travel Bursary",
    field: "Physics",
    location: "Hyderabad, TS",
    description: "Funding for postgraduate researchers presenting papers at international conferences.",
    goal: 600,
    raised: 390,
    daysLeft: 15,
    providerWallet: null,
    applications: [],
  },
  {
    id: 6,
    title: "Public Interest Law Scholarship",
    field: "Law",
    location: "Bengaluru, KA",
    description: "Supporting law students specialising in digital rights and public interest litigation.",
    goal: 450,
    raised: 210,
    daysLeft: 18,
    providerWallet: null,
    applications: [],
  },
];

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [pools, setPools] = useState(INITIAL_POOLS);
  const [myApplications, setMyApplications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  const addPool = useCallback((pool) => {
    setPools(prev => [...prev, { ...pool, id: prev.length + 1, raised: 0, applications: [] }]);
    addActivity(`New scholarship created: ${pool.title}`);
  }, []);

  const applyToPool = useCallback((poolId, application) => {
    setPools(prev => prev.map(p =>
      p.id === poolId
        ? { ...p, applications: [...p.applications, { ...application, id: Date.now(), status: "pending" }] }
        : p
    ));
    setMyApplications(prev => [...prev, { ...application, poolId, status: "pending", appliedAt: new Date().toISOString() }]);
    addActivity(`New application received for pool #${poolId}`);
  }, []);

  const updateApplication = useCallback((poolId, appId, status) => {
    setPools(prev => prev.map(p =>
      p.id === poolId
        ? { ...p, applications: p.applications.map(a => a.id === appId ? { ...a, status } : a) }
        : p
    ));
    setMyApplications(prev => prev.map(a =>
      a.poolId === poolId && a.id === appId ? { ...a, status } : a
    ));
    addActivity(`Application ${status === "approved" ? "approved" : "rejected"} for pool #${poolId}`);
  }, []);

  const recordDonation = useCallback((poolId, amount, txHash) => {
    setPools(prev => prev.map(p =>
      p.id === poolId ? { ...p, raised: Math.min(p.raised + amount, p.goal) } : p
    ));
    addActivity(`Donation of ${amount} XLM recorded — Tx: ${txHash?.slice(0, 8)}...`);
  }, []);

  const addActivity = (message) => {
    setActivityFeed(prev => [
      { id: Date.now(), message, time: new Date().toISOString() },
      ...prev.slice(0, 19),
    ]);
  };

  return (
    <AppContext.Provider value={{
      pools, myApplications, activityFeed,
      addPool, applyToPool, updateApplication, recordDonation,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
