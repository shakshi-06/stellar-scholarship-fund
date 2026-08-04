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

  if (!accessResult) throw new Error("CONNECTION_FAILED");

  if (accessResult.error) {
    const msg = (accessResult.error.message || "").toLowerCase();
    if (msg.includes("declin") || msg.includes("reject") || msg.includes("denied")) {
      throw new Error("USER_DECLINED");
    }
    throw new Error("CONNECTION_FAILED");
  }

  const address = accessResult.address;
  if (!address) throw new Error("CONNECTION_FAILED");
  return address;
};

export const signWithFreighter = async (xdr, publicKey) => {
  const result = await signTransaction(xdr, {
    networkPassphrase: "Test SDF Network ; September 2015",
    address: publicKey,
  });

  if (!result) throw new Error("SIGN_FAILED");

  if (result.error) {
    const msg = (result.error.message || "").toLowerCase();
    if (msg.includes("declin") || msg.includes("reject") || msg.includes("denied")) {
      throw new Error("USER_DECLINED_SIGN");
    }
    throw new Error("SIGN_FAILED");
  }

  if (!result.signedTxXdr) throw new Error("SIGN_FAILED");
  return result.signedTxXdr;
};