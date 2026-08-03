import {
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

export const checkFreighterInstalled = async () => {
  try {
    const result = await isConnected();
    return !!result.isConnected;
  } catch {
    return false;
  }
};

export const connectFreighter = async () => {
  const installed = await checkFreighterInstalled();
  if (!installed) throw new Error("FREIGHTER_NOT_INSTALLED");

  const accessResult = await requestAccess();
  if (accessResult.error) {
    const msg = accessResult.error.message || "";
    if (msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied")) {
      throw new Error("USER_DECLINED");
    }
    throw new Error("CONNECTION_FAILED");
  }
  const address = accessResult.address;
  if (!address) throw new Error("CONNECTION_FAILED");
  return address;
};

export const signWithFreighter = async (xdr, _networkPassphrase) => {
  const result = await signTransaction(xdr, { network: "TESTNET" });
  if (result.error) {
    const msg = result.error.message || "";
    if (msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied")) {
      throw new Error("USER_DECLINED_SIGN");
    }
    throw new Error("SIGN_FAILED");
  }
  return result.signedTxXdr;
};