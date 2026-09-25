import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/utils/password";
import { generateOtp, hashOpaqueValue, signAccessToken, verifyAccessToken } from "../src/utils/tokens";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("Password@123");
    expect(hash).not.toBe("Password@123");
    await expect(verifyPassword("Password@123", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });
});

describe("access tokens", () => {
  it("signs and verifies a JWT round-trip", () => {
    const payload = { userId: "user-1", roles: ["user"], permissions: ["profiles.view"] };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.roles).toEqual(payload.roles);
  });

  it("rejects a tampered token", () => {
    const token = signAccessToken({ userId: "u1", roles: [], permissions: [] });
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });
});

describe("otp", () => {
  it("generates a 6-digit numeric code", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("hashes deterministically for comparison", () => {
    expect(hashOpaqueValue("123456")).toBe(hashOpaqueValue("123456"));
    expect(hashOpaqueValue("123456")).not.toBe(hashOpaqueValue("654321"));
  });
});
