import * as StellarSdk from "@stellar/stellar-sdk";

export const NETWORK = "TESTNET";
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

// Deployed contract address (placeholder — replace after deployment)
export const CONTRACT_ID = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);
export const rpcServer = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

export const formatXLM = (amount) => {
  if (!amount) return "0.00";
  return parseFloat(amount).toFixed(2);
};

export const shortAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const fetchXLMBalance = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (b) => b.asset_type === "native"
    );
    return xlmBalance ? xlmBalance.balance : "0";
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }
    throw new Error("BALANCE_FETCH_FAILED");
  }
};

export const sendXLMTransaction = async (
  fromPublicKey,
  toPublicKey,
  amount,
  memo = ""
) => {
  try {
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(toPublicKey)) {
      throw new Error("INVALID_DESTINATION");
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error("INVALID_AMOUNT");
    }
    if (parseFloat(amount) < 1) {
      throw new Error("AMOUNT_TOO_LOW");
    }

    const account = await server.loadAccount(fromPublicKey);
    const fee = await server.fetchBaseFee();

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: String(fee * 2),
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: toPublicKey,
          asset: StellarSdk.Asset.native(),
          amount: String(parseFloat(amount).toFixed(7)),
        })
      )
      .setTimeout(30);

    if (memo && memo.trim()) {
      txBuilder.addMemo(StellarSdk.Memo.text(memo.trim().slice(0, 28)));
    }

    const transaction = txBuilder.build();
    const xdr = transaction.toXDR();
    return { xdr, transaction };
  } catch (err) {
    if (["INVALID_DESTINATION", "INVALID_AMOUNT", "AMOUNT_TOO_LOW"].includes(err.message)) {
      throw err;
    }
    throw new Error("TX_BUILD_FAILED");
  }
};

export const submitSignedTransaction = async (signedXDR) => {
  try {
    const tx = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      NETWORK_PASSPHRASE
    );
    const result = await server.submitTransaction(tx);
    return result;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.extras) {
      const codes = err.response.data.extras.result_codes;
      if (codes.transaction === "tx_insufficient_balance") {
        throw new Error("INSUFFICIENT_BALANCE");
      }
      if (codes.operations && codes.operations.includes("op_underfunded")) {
        throw new Error("INSUFFICIENT_BALANCE");
      }
    }
    throw new Error("TX_SUBMIT_FAILED");
  }
};

export const getExplorerUrl = (hash) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;

export const getFriendbotUrl = (address) =>
  `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`;

// Fund a testnet account via Friendbot
export const fundTestnetAccount = async (publicKey) => {
  const res = await fetch(getFriendbotUrl(publicKey));
  if (!res.ok) throw new Error("FUND_FAILED");
  return await res.json();
};
