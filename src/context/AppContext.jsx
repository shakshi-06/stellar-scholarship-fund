import { createContext, useContext, useState, useCallback } from "react";

// SC-FUND memo used on all donation transactions
// This lets us detect ScholarChain payments on Horizon
export const SC_MEMO = "SC-FUND";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Requests posted by students
  const [requests, setRequests] = useState([]);
  // Donations made by donors { requestId, amount, txHash, from, to, time }
  const [donations, setDonations] = useState([]);
  // Activity feed entries
  const [activityFeed, setActivityFeed] = useState([]);

  const addActivity = useCallback((message) => {
    setActivityFeed(prev => [
      { id: Date.now(), message, time: new Date().toISOString() },
      ...prev.slice(0, 29),
    ]);
  }, []);

  // Student posts a new funding request
  const postRequest = useCallback((request) => {
    const now = Date.now();
    const expiresAt = now + request.durationDays * 24 * 60 * 60 * 1000;
    const newRequest = {
      ...request,
      id: now,
      raised: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      donorCount: 0,
    };
    setRequests(prev => [newRequest, ...prev]);
    addActivity(`New request posted: ${request.purpose}`);
    return newRequest;
  }, [addActivity]);

  // Donor funds a student request
  const recordFunding = useCallback((requestId, amount, txHash, fromWallet) => {
    setRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, raised: r.raised + amount, donorCount: r.donorCount + 1 }
        : r
    ));
    const entry = {
      id: Date.now(),
      requestId,
      amount,
      txHash,
      from: fromWallet,
      time: new Date().toISOString(),
    };
    setDonations(prev => [entry, ...prev]);
    addActivity(`${amount} XLM funded — Tx: ${txHash?.slice(0, 8)}...`);
  }, [addActivity]);

  // Check if a request is expired
  const isExpired = useCallback((request) => {
    return new Date(request.expiresAt) < new Date();
  }, []);

  // Get active (non-expired) requests
  const activeRequests = requests.filter(r => !isExpired(r));

  // Get expired requests
  const expiredRequests = requests.filter(r => isExpired(r));

  // Get donations for a specific request
  const getDonationsForRequest = useCallback((requestId) => {
    return donations.filter(d => d.requestId === requestId);
  }, [donations]);

  // Get donations made by a specific wallet
  const getDonationsByWallet = useCallback((wallet) => {
    return donations.filter(d => d.from === wallet);
  }, [donations]);

  // Get requests posted by a specific wallet
  const getRequestsByWallet = useCallback((wallet) => {
    return requests.filter(r => r.studentWallet === wallet);
  }, [requests]);

  return (
    <AppContext.Provider value={{
      requests,
      activeRequests,
      expiredRequests,
      donations,
      activityFeed,
      postRequest,
      recordFunding,
      isExpired,
      getDonationsForRequest,
      getDonationsByWallet,
      getRequestsByWallet,
      SC_MEMO,
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
