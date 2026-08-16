import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  isContractDeployed,
  contractGetAllRequests,
  contractPostRequest,
  contractRecordDonation,
  contractIsFunded,
} from "../utils/contract";

export const SC_MEMO = "SC-FUND";

const LS_REQUESTS  = "scfund_requests";
const LS_DONATIONS = "scfund_donations";
const LS_FEED      = "scfund_feed";

const loadLS = (key, fb) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; }
  catch { return fb; }
};
const saveLS = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [requests, setRequests]     = useState(() => loadLS(LS_REQUESTS, []));
  const [donations, setDonations]   = useState(() => loadLS(LS_DONATIONS, []));
  const [activityFeed, setFeed]     = useState(() => loadLS(LS_FEED, []));
  const [contractLoading, setLoading] = useState(false);
  const [usingContract, setUsingContract] = useState(false);

  // On mount: if contract is deployed, load from chain
  useEffect(() => {
    if (!isContractDeployed()) return;
    setLoading(true);
    contractGetAllRequests()
      .then(onChain => {
        if (onChain?.length > 0) {
          setRequests(onChain);
          saveLS(LS_REQUESTS, onChain);
        }
        setUsingContract(true);
      })
      .catch(e => console.error("Contract load failed, using localStorage:", e))
      .finally(() => setLoading(false));
  }, []);

  // Persist to localStorage on every change
  useEffect(() => { saveLS(LS_REQUESTS,  requests);    }, [requests]);
  useEffect(() => { saveLS(LS_DONATIONS, donations);   }, [donations]);
  useEffect(() => { saveLS(LS_FEED,      activityFeed);}, [activityFeed]);

  const addActivity = useCallback((msg) => {
    setFeed(prev => [{ id: Date.now(), message: msg, time: new Date().toISOString() }, ...prev.slice(0, 29)]);
  }, []);

  // Student posts a request — optimistic update + on-chain write
  const postRequest = useCallback(async (publicKey, data) => {
    const now = Date.now();
    const optimistic = {
      ...data,
      id: now,
      raised: 0,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + data.durationDays * 86400000).toISOString(),
      donorCount: 0,
      isActive: true,
      studentWallet: publicKey,
    };
    setRequests(prev => [optimistic, ...prev]);
    addActivity(`New request: ${data.purpose}`);

    if (isContractDeployed()) {
      try {
        await contractPostRequest(publicKey, data);
        // Reload from chain to get real ledger timestamps
        const onChain = await contractGetAllRequests();
        if (onChain?.length > 0) {
          setRequests(onChain);
          saveLS(LS_REQUESTS, onChain);
        }
      } catch (e) {
        console.error("On-chain post failed, keeping local copy:", e);
      }
    }
    return optimistic;
  }, [addActivity]);

  // Donor records funding — optimistic update + on-chain write
  const recordFunding = useCallback(async (publicKey, requestId, amountXLM, txHash) => {
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, raised: r.raised + amountXLM, donorCount: r.donorCount + 1 } : r
    ));
    const entry = { id: Date.now(), requestId, amount: amountXLM, txHash, from: publicKey, time: new Date().toISOString() };
    setDonations(prev => [entry, ...prev]);
    addActivity(`${amountXLM} XLM funded — Tx: ${txHash?.slice(0, 8)}...`);

    if (isContractDeployed()) {
      try {
        await contractRecordDonation(publicKey, requestId, amountXLM);
        const onChain = await contractGetAllRequests();
        if (onChain?.length > 0) { setRequests(onChain); saveLS(LS_REQUESTS, onChain); }
      } catch (e) { console.error("On-chain record failed:", e); }
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
  const expiredRequests = requests.filter(r => r.isActive === false || isExpired(r));

  const getDonationsByWallet  = useCallback((w) => donations.filter(d => d.from === w), [donations]);
  const getRequestsByWallet   = useCallback((w) => requests.filter(r => r.studentWallet === w), [requests]);
  const getDonationsForRequest= useCallback((id) => donations.filter(d => d.requestId === id), [donations]);

  const refreshFromContract = useCallback(async () => {
    if (!isContractDeployed()) return;
    setLoading(true);
    try {
      const onChain = await contractGetAllRequests();
      if (onChain?.length > 0) { setRequests(onChain); saveLS(LS_REQUESTS, onChain); }
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
