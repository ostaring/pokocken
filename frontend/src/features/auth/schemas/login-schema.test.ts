import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/auth/schemas/login-schema";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      username: "admin",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects too-short usernames", () => {
    const result = loginSchema.safeParse({
      username: "ab",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects too-short passwords", () => {
    const result = loginSchema.safeParse({
      username: "admin",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
