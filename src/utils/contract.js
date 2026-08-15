import * as StellarSdk from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE, rpcServer, server } from "./stellar";
import { signWithFreighter } from "./freighter";

// Set this after deploying: stellar contract deploy --wasm request_pool.wasm --network testnet --source deployer
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "";

const STROOPS = 10_000_000;

export const isContractDeployed = () =>
  !!CONTRACT_ID && CONTRACT_ID.startsWith("C") && CONTRACT_ID.length > 50;

function toScVal(value, type) {
  return StellarSdk.nativeToScVal(value, { type });
}

function parseScVal(val) {
  try { return StellarSdk.scValToNative(val); } catch { return null; }
}

async function simulate(method, args) {
  if (!isContractDeployed()) return null;
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const kp = StellarSdk.Keypair.random();
    const acct = new StellarSdk.Account(kp.publicKey(), "0");
    const tx = new StellarSdk.TransactionBuilder(acct, {
      fee: "1000000", networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(contract.call(method, ...args)).setTimeout(30).build();
    const sim = await rpcServer.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(sim)) return null;
    return sim.result?.retval ? parseScVal(sim.result.retval) : null;
  } catch (e) { console.error("simulate", e); return null; }
}

async function invoke(publicKey, method, args) {
  if (!isContractDeployed()) throw new Error("CONTRACT_NOT_DEPLOYED");
  const account = await server.loadAccount(publicKey);
  const fee = await server.fetchBaseFee();
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: String(Math.max(fee * 10, 1000000)),
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(contract.call(method, ...args)).setTimeout(60).build();
  const sim = await rpcServer.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) throw new Error("CONTRACT_SIMULATE_FAILED");
  const prepared = StellarSdk.rpc.assembleTransaction(tx, sim).build();
  const signed = await signWithFreighter(prepared.toXDR(), publicKey);
  const finalTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
  return server.submitTransaction(finalTx);
}

function parseRequest(raw) {
  if (!raw) return null;
  try {
    const goalStroops = Number(raw.goal_stroops ?? 0);
    const raisedStroops = Number(raw.raised_stroops ?? 0);
    const createdAt = Number(raw.created_at ?? 0);
    const expiresAt = Number(raw.expires_at ?? 0);
    return {
      id: Number(raw.id),
      studentWallet: raw.student_wallet?.toString() ?? "",
      purpose: raw.purpose?.toString() ?? "",
      field: raw.field?.toString() ?? "",
      location: raw.location?.toString() ?? "",
      description: raw.description?.toString() ?? "",
      goalXLM: goalStroops / STROOPS,
      raised: raisedStroops / STROOPS,
      createdAt: createdAt ? new Date(createdAt * 1000).toISOString() : new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : new Date().toISOString(),
      donorCount: Number(raw.donor_count ?? 0),
      isActive: raw.is_active ?? true,
    };
  } catch (e) { console.error("parseRequest", e, raw); return null; }
}

export const contractGetCount = async () => {
  const r = await simulate("get_count", []);
  return typeof r === "bigint" ? Number(r) : (r ?? 0);
};

export const contractGetRequest = async (id) => {
  const r = await simulate("get_request", [toScVal(id, "u64")]);
  return r ? parseRequest(r) : null;
};

export const contractGetAllRequests = async () => {
  const count = await contractGetCount();
  if (!count) return [];
  const start = Math.max(1, count - 49);
  const results = [];
  for (let i = count; i >= start; i--) {
    try {
      const req = await contractGetRequest(i);
      if (req) results.push(req);
    } catch {}
  }
  return results;
};

export const contractPostRequest = async (publicKey, { purpose, field, location, description, goalXLM, durationDays }) => {
  const goalStroops = BigInt(Math.round(parseFloat(goalXLM) * STROOPS));
  return invoke(publicKey, "post_request", [
    StellarSdk.nativeToScVal(publicKey, { type: "address" }),
    toScVal(purpose, "string"),
    toScVal(field, "string"),
    toScVal(location, "string"),
    toScVal(description, "string"),
    StellarSdk.nativeToScVal(goalStroops, { type: "i128" }),
    toScVal(parseInt(durationDays), "u64"),
  ]);
};

export const contractRecordDonation = async (publicKey, requestId, amountXLM) => {
  const amountStroops = BigInt(Math.round(parseFloat(amountXLM) * STROOPS));
  return invoke(publicKey, "record_donation", [
    StellarSdk.nativeToScVal(publicKey, { type: "address" }),
    toScVal(requestId, "u64"),
    StellarSdk.nativeToScVal(amountStroops, { type: "i128" }),
  ]);
};

export const contractIsFunded = async (wallet) => {
  if (!wallet || !isContractDeployed()) return false;
  const r = await simulate("is_previously_funded", [
    StellarSdk.nativeToScVal(wallet, { type: "address" })
  ]);
  return r === true;
};
