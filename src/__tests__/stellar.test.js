import { describe, it, expect, vi } from "vitest";

vi.mock("@stellar/stellar-sdk", async () => {
  function MockServer() { return {}; }
  function MockRpcServer() { return {}; }
  return {
    Horizon: { Server: MockServer },
    rpc: { Server: MockRpcServer },
    Networks: { TESTNET: "Test SDF Network ; September 2015" },
    Asset: { native: () => ({}) },
    TransactionBuilder: function() { return { addOperation: () => this, setTimeout: () => this, addMemo: () => this, build: () => ({}) }; },
    Operation: { payment: () => ({}) },
    Memo: { text: (t) => t },
    StrKey: { isValidEd25519PublicKey: (k) => typeof k === "string" && k.startsWith("G") && k.length === 56 },
  };
});

import { formatXLM, shortAddress, NETWORK, HORIZON_URL, getExplorerUrl } from "../utils/stellar";

describe("formatXLM", () => {
  it("formats a number string to 2 decimal places", () => {
    expect(formatXLM("100.5")).toBe("100.50");
    expect(formatXLM("0")).toBe("0.00");
    expect(formatXLM("9999.1234")).toBe("9999.12");
  });

  it("returns 0.00 for null or undefined", () => {
    expect(formatXLM(null)).toBe("0.00");
    expect(formatXLM(undefined)).toBe("0.00");
    expect(formatXLM("")).toBe("0.00");
  });
});

describe("shortAddress", () => {
  it("shortens a Stellar address correctly", () => {
    const addr = "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM";
    const result = shortAddress(addr);
    expect(result).toBe("GAHJJJ...6GEM");
    expect(result.length).toBeLessThan(20);
  });

  it("returns empty string for falsy input", () => {
    expect(shortAddress(null)).toBe("");
    expect(shortAddress(undefined)).toBe("");
    expect(shortAddress("")).toBe("");
  });
});

describe("Network constants", () => {
  it("uses testnet network and horizon URL", () => {
    expect(NETWORK).toBe("TESTNET");
    expect(HORIZON_URL).toContain("testnet");
  });
});

describe("getExplorerUrl", () => {
  it("generates correct Stellar Expert URL", () => {
    const url = getExplorerUrl("abc123");
    expect(url).toContain("testnet");
    expect(url).toContain("abc123");
    expect(url).toContain("stellar.expert");
  });
});
