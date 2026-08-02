import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the freighter API module
vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn(),
  getPublicKey: vi.fn(),
  signTransaction: vi.fn(),
  requestAccess: vi.fn(),
  getNetwork: vi.fn(),
}));

import * as freighterApi from "@stellar/freighter-api";
import { checkFreighterInstalled, connectFreighter } from "../utils/freighter";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("checkFreighterInstalled", () => {
  it("returns true when freighter is connected", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    const result = await checkFreighterInstalled();
    expect(result).toBe(true);
  });

  it("returns false when freighter is not connected", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: false });
    const result = await checkFreighterInstalled();
    expect(result).toBe(false);
  });

  it("returns false on error", async () => {
    freighterApi.isConnected.mockRejectedValue(new Error("Extension not found"));
    const result = await checkFreighterInstalled();
    expect(result).toBe(false);
  });
});

describe("connectFreighter", () => {
  it("throws FREIGHTER_NOT_INSTALLED when not available", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: false });
    await expect(connectFreighter()).rejects.toThrow("FREIGHTER_NOT_INSTALLED");
  });

  it("returns public key on success", async () => {
    const mockKey = "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM";
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    freighterApi.requestAccess.mockResolvedValue(undefined);
    freighterApi.getPublicKey.mockResolvedValue({ publicKey: mockKey });
    const result = await connectFreighter();
    expect(result).toBe(mockKey);
  });

  it("throws USER_DECLINED when user cancels", async () => {
    freighterApi.isConnected.mockResolvedValue({ isConnected: true });
    freighterApi.requestAccess.mockRejectedValue(new Error("User declined access"));
    await expect(connectFreighter()).rejects.toThrow("USER_DECLINED");
  });
});
