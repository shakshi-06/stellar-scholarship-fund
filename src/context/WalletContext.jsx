import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { connectFreighter, checkFreighterInstalled } from "../utils/freighter";
import { fetchXLMBalance } from "../utils/stellar";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [freighterInstalled, setFreighterInstalled] = useState(null);
  // role: "student" | "donor" | null
  const [role, setRole] = useState(null);

  useEffect(() => {
    checkFreighterInstalled().then(setFreighterInstalled);
  }, []);

  const refreshBalance = useCallback(async (key) => {
    const pk = key || publicKey;
    if (!pk) return;
    setIsLoadingBalance(true);
    try {
      const bal = await fetchXLMBalance(pk);
      setBalance(bal);
    } catch (err) {
      if (err.message === "ACCOUNT_NOT_FOUND") setBalance("0");
    } finally {
      setIsLoadingBalance(false);
    }
  }, [publicKey]);

  const connect = useCallback(async (selectedRole) => {
    setIsConnecting(true);
    setWalletError(null);
    try {
      const pk = await connectFreighter();
      setPublicKey(pk);
      setRole(selectedRole);
      await refreshBalance(pk);
    } catch (err) {
      setWalletError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setBalance(null);
    setWalletError(null);
    setRole(null);
  }, []);

  return (
    <WalletContext.Provider value={{
      publicKey, balance, isConnecting, isLoadingBalance,
      walletError, freighterInstalled, role,
      connect, disconnect, refreshBalance,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};
