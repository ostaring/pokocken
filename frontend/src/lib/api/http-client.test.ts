import { describe, expect, it } from "vitest";
import { buildApiUrl } from "./http-client";

describe("buildApiUrl", () => {
  it("joins base url and path cleanly", () => {
    expect(buildApiUrl("/api/recipes", "https://api.example.com")).toBe(
      "https://api.example.com/api/recipes",
    );
  });

  it("normalizes trailing and leading slashes", () => {
    expect(buildApiUrl("api/recipes", "https://api.example.com/")).toBe(
      "https://api.example.com/api/recipes",
    );
  });
});
