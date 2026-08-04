import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  signTransaction: vi.fn(),
}));

import * as freighterApi from "@stellar/freighter-api";
import { checkFreighterInstalled, connectFreighter } from "../utils/freighter";

beforeEach(() => vi.clearAllMocks());

describe("checkFreighterInstalled", () => {
  it("returns true when freighter is connected", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    expect(await checkFreighterInstalled()).toBe(true);
  });

  it("returns false when freighter is not connected", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: false });
    expect(await checkFreighterInstalled()).toBe(false);
  });

  it("returns false on error", async () => {
    freighterApi.isConnected.mockRejectedValue(new Error("Extension not found"));
    expect(await checkFreighterInstalled()).toBe(false);
  });
});

describe("connectFreighter", () => {
  it("throws FREIGHTER_NOT_INSTALLED when not available", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: false });
    await expect(connectFreighter()).rejects.toThrow("FREIGHTER_NOT_INSTALLED");
  });

  it("returns address on success", async () => {
    const mockKey = "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM";
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    freighterApi.requestAccess.mockResolvedValue({ address: mockKey });
    expect(await connectFreighter()).toBe(mockKey);
  });

  it("throws CONNECTION_FAILED when requestAccess returns undefined", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    freighterApi.requestAccess.mockResolvedValue(undefined);
    await expect(connectFreighter()).rejects.toThrow("CONNECTION_FAILED");
  });

  it("throws USER_DECLINED when error message contains declined", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    freighterApi.requestAccess.mockResolvedValue({
      error: { message: "User declined access" },
    });
    await expect(connectFreighter()).rejects.toThrow("USER_DECLINED");
  });

  it("throws USER_DECLINED when error message contains rejected", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    freighterApi.requestAccess.mockResolvedValue({
      error: { message: "The user rejected this request." },
    });
    await expect(connectFreighter()).rejects.toThrow("USER_DECLINED");
  });

  it("throws CONNECTION_FAILED when address is missing", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    freighterApi.requestAccess.mockResolvedValue({ address: null });
    await expect(connectFreighter()).rejects.toThrow("CONNECTION_FAILED");
  });
});