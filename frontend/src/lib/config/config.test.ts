import { describe, expect, it } from "vitest";
import { resolveAppConfig } from "@/lib/config/config";

describe("resolveAppConfig", () => {
  it("defaults to mock mode and localhost backend url", () => {
    const config = resolveAppConfig({});

    expect(config).toEqual({
      apiMode: "mock",
      apiBaseUrl: "http://localhost:5080",
    });
  });

  it("uses http mode when configured", () => {
    const config = resolveAppConfig({
      VITE_API_MODE: "http",
      VITE_API_BASE_URL: "https://api.example.com",
    });

    expect(config).toEqual({
      apiMode: "http",
      apiBaseUrl: "https://api.example.com",
    });
  });
});
