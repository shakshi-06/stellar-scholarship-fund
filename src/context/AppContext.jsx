import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  isContractDeployed,
  contractGetAllRequests,
  contractPostRequest,
  contractRecordDonation,
  contractIsFunded,
} from "../utils/contract";

export const SC_MEMO = "SC-FUND";

const LS_REQ  = "scfund_v3_requests";
const LS_DON  = "scfund_v3_donations";

// Clear old broken keys from previous versions
try {
  localStorage.removeItem("scfund_requests");
  localStorage.removeItem("scfund_donations");
  localStorage.removeItem("scfund_v2_requests");
  localStorage.removeItem("scfund_v2_donations");
  localStorage.removeItem("scfund_feed");
} catch {}

// Deduplicate requests — keeps the one with highest raised value
function dedupeRequests(reqs) {
  const seen = new Map();
  for (const r of reqs) {
    const key = r.studentWallet + "||" + r.purpose;
    const existing = seen.get(key);
    // Keep whichever has a valid goalXLM and higher raised
    if (!existing || 
        (!existing.goalXLM && r.goalXLM) ||
        (r.raised || 0) > (existing.raised || 0)) {
      seen.set(key, r);
    }
  }
  return Array.from(seen.values());
}

const loadLS = (key, fb) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; }
  catch { return fb; }
};
const saveLS = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [requests,  setRequests]  = useState(() => dedupeRequests(loadLS(LS_REQ, [])));
  const [donations, setDonations] = useState(() => loadLS(LS_DON, []));
  const [activityFeed, setFeed]   = useState([]);
  const [contractLoading, setLoading] = useState(false);
  const [usingContract, setUsingContract] = useState(false);

  // Persist every change immediately
  useEffect(() => { saveLS(LS_REQ,  requests);  }, [requests]);
  useEffect(() => { saveLS(LS_DON,  donations); }, [donations]);

  // On mount: try to load from contract — NEVER wipe local data
  useEffect(() => {
    if (!isContractDeployed()) return;
    setLoading(true);
    contractGetAllRequests()
      .then(onChain => {
        // Only merge if contract returned real data
        if (Array.isArray(onChain) && onChain.length > 0) {
          setRequests(prev => {
            // Keep all local requests not on chain, add on-chain ones
            const onChainIds = new Set(onChain.map(r => String(r.id)));
            const localOnly = prev.filter(r => !onChainIds.has(String(r.id)));
            const merged = dedupeRequests([...onChain, ...localOnly]);
            saveLS(LS_REQ, merged);
            return merged;
          });
          setUsingContract(true);
        }
        // If contract empty or failed: keep local data untouched
      })
      .catch(e => console.error("Contract load failed, keeping local data:", e))
      .finally(() => setLoading(false));
  }, []);

  const addActivity = useCallback((msg) => {
    setFeed(prev => [{ id: Date.now(), message: msg, time: new Date().toISOString() }, ...prev.slice(0, 29)]);
  }, []);

  // Student posts a request
  const postRequest = useCallback(async (publicKey, data) => {
    const now = Date.now();
    const goalXLM = parseFloat(data.goalXLM);
    const durationDays = parseInt(data.durationDays) || 14;

    // Build optimistic entry with all fields DonorPortal needs
    const optimistic = {
      id: now,
      studentWallet: publicKey,
      purpose: data.purpose,
      field: data.field,
      location: data.location,
      description: data.description,
      goalXLM: goalXLM,          // required by DonorPortal for remaining calc
      raised: 0,                  // required by DonorPortal for remaining calc
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + durationDays * 86400000).toISOString(),
      durationDays: durationDays,
      donorCount: 0,
      isActive: true,
    };

    // Save to state + localStorage immediately so it persists on role switch
    setRequests(prev => {
      const updated = [optimistic, ...prev];
      saveLS(LS_REQ, updated);
      return updated;
    });

    addActivity(`New request posted: ${data.purpose}`);

    // Write to contract if deployed
    if (isContractDeployed()) {
      try {
        await contractPostRequest(publicKey, { ...data, goalXLM, durationDays });
        // Reload from chain to get real ledger timestamps
        const onChain = await contractGetAllRequests();
        if (Array.isArray(onChain) && onChain.length > 0) {
          setRequests(prev => {
            const onChainIds = new Set(onChain.map(r => String(r.id)));
            const localOnly = prev.filter(r => !onChainIds.has(String(r.id)));
            const merged = dedupeRequests([...onChain, ...localOnly]);
            saveLS(LS_REQ, merged);
            return merged;
          });
        }
      } catch (e) {
        console.error("On-chain post failed, keeping local:", e);
        // Local entry already saved — it persists
      }
    }

    return optimistic;
  }, [addActivity]);

  // Donor records a funding
  const recordFunding = useCallback(async (publicKey, requestId, amountXLM, txHash) => {
    setRequests(prev => {
      const updated = prev.map(r =>
        r.id === requestId
          ? { ...r, raised: (r.raised || 0) + amountXLM, donorCount: (r.donorCount || 0) + 1 }
          : r
      );
      saveLS(LS_REQ, updated);
      return updated;
    });

    const entry = {
      id: Date.now(),
      requestId,
      amount: amountXLM,
      txHash,
      from: publicKey,
      time: new Date().toISOString(),
    };

    setDonations(prev => {
      const updated = [entry, ...prev];
      saveLS(LS_DON, updated);
      return updated;
    });

    addActivity(`${amountXLM} XLM funded — Tx: ${txHash?.slice(0, 8)}...`);

    if (isContractDeployed()) {
      try {
        await contractRecordDonation(publicKey, requestId, amountXLM);
        const onChain = await contractGetAllRequests();
        if (Array.isArray(onChain) && onChain.length > 0) {
          setRequests(prev => {
            const onChainIds = new Set(onChain.map(r => String(r.id)));
            const localOnly = prev.filter(r => !onChainIds.has(String(r.id)));
            const merged = dedupeRequests([...onChain, ...localOnly]);
            saveLS(LS_REQ, merged);
            return merged;
          });
        }
      } catch (e) {
        console.error("On-chain record failed:", e);
      }
    }

    return entry;
  }, [addActivity]);

  const checkPreviouslyFunded = useCallback(async (wallet) => {
    if (isContractDeployed()) {
      try { return await contractIsFunded(wallet); } catch {}
    }
    return donations.some(d => {
      const req = requests.find(r => r.id === d.requestId);
      return req?.studentWallet === wallet && req?.raised >= req?.goalXLM;
    });
  }, [donations, requests]);

  const isExpired = useCallback((r) => new Date(r.expiresAt) < new Date(), []);

  const activeRequests  = requests.filter(r => r.isActive !== false && !isExpired(r));
  const expiredRequests = requests.filter(r => r.isActive === false  ||  isExpired(r));

  const getDonationsByWallet   = useCallback((w) => donations.filter(d => d.from === w), [donations]);
  const getRequestsByWallet    = useCallback((w) => requests.filter(r => r.studentWallet === w), [requests]);
  const getDonationsForRequest = useCallback((id) => donations.filter(d => d.requestId === id), [donations]);

  const refreshFromContract = useCallback(async () => {
    if (!isContractDeployed()) return;
    setLoading(true);
    try {
      const onChain = await contractGetAllRequests();
      if (onChain?.length > 0) { setRequests(onChain); saveLS(LS_REQ, onChain); }
    } catch {}
    finally { setLoading(false); }
  }, []);

  return (
    <AppContext.Provider value={{
      requests, activeRequests, expiredRequests,
      donations, activityFeed,
      contractLoading, usingContract, SC_MEMO,
      postRequest, recordFunding,
      checkPreviouslyFunded, isExpired,
      getDonationsByWallet, getRequestsByWallet, getDonationsForRequest,
      refreshFromContract,
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
