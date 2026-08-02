import {
  isConnected,
  getPublicKey,
  signTransaction,
  requestAccess,
  getNetwork,
} from "@stellar/freighter-api";

export const checkFreighterInstalled = async () => {
  try {
    const connected = await isConnected();
    return connected && connected.isConnected;
  } catch {
    return false;
  }
};

export const connectFreighter = async () => {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error("FREIGHTER_NOT_INSTALLED");
  }
  try {
    await requestAccess();
    const result = await getPublicKey();
    const pubKey = result.publicKey || result;
    if (!pubKey) throw new Error("NO_PUBLIC_KEY");
    return pubKey;
  } catch (err) {
    if (err.message === "FREIGHTER_NOT_INSTALLED") throw err;
    if (err.message && err.message.includes("User declined")) {
      throw new Error("USER_DECLINED");
    }
    throw new Error("CONNECTION_FAILED");
  }
};

export const getFreighterNetwork = async () => {
  try {
    const net = await getNetwork();
    return net.network || net;
  } catch {
    return null;
  }
};

export const signWithFreighter = async (xdr, networkPassphrase) => {
  try {
    const result = await signTransaction(xdr, {
      networkPassphrase,
    });
    return result.signedTxXdr || result;
  } catch (err) {
    if (err.message && err.message.includes("User declined")) {
      throw new Error("USER_DECLINED_SIGN");
    }
    throw new Error("SIGN_FAILED");
  }
};
