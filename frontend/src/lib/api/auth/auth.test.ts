import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAdminSession, loginAdmin, logoutAdmin } from "@/lib/api/auth/auth";

const {
  mockResolveAppConfig,
  mockFetchAdminSessionHttp,
  mockLoginAdminHttp,
  mockLogoutAdminHttp,
  mockFetchAdminSessionMock,
  mockLoginAdminMock,
  mockLogoutAdminMock,
} = vi.hoisted(() => ({
  mockResolveAppConfig: vi.fn(),
  mockFetchAdminSessionHttp: vi.fn(),
  mockLoginAdminHttp: vi.fn(),
  mockLogoutAdminHttp: vi.fn(),
  mockFetchAdminSessionMock: vi.fn(),
  mockLoginAdminMock: vi.fn(),
  mockLogoutAdminMock: vi.fn(),
}));

vi.mock("@/lib/config/config", () => ({
  resolveAppConfig: mockResolveAppConfig,
}));

vi.mock("./http/auth-adapter", () => ({
  fetchAdminSessionHttp: mockFetchAdminSessionHttp,
  loginAdminHttp: mockLoginAdminHttp,
  logoutAdminHttp: mockLogoutAdminHttp,
}));

vi.mock("./mock/auth-adapter", () => ({
  fetchAdminSessionMock: mockFetchAdminSessionMock,
  loginAdminMock: mockLoginAdminMock,
  logoutAdminMock: mockLogoutAdminMock,
}));

describe("auth api adapter selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses mock auth adapter in mock mode", async () => {
    mockResolveAppConfig.mockReturnValue({
      apiMode: "mock",
      apiBaseUrl: "http://localhost:5080",
    });
    mockFetchAdminSessionMock.mockResolvedValueOnce(null);
    mockLoginAdminMock.mockResolvedValueOnce({ username: "admin" });
    mockLogoutAdminMock.mockResolvedValueOnce(undefined);

    await fetchAdminSession();
    await loginAdmin("admin", "password123");
    await logoutAdmin();

    expect(mockFetchAdminSessionMock).toHaveBeenCalled();
    expect(mockLoginAdminMock).toHaveBeenCalledWith("admin", "password123");
    expect(mockLogoutAdminMock).toHaveBeenCalled();
    expect(mockFetchAdminSessionHttp).not.toHaveBeenCalled();
  });

  it("uses http auth adapter in http mode", async () => {
    mockResolveAppConfig.mockReturnValue({
      apiMode: "http",
      apiBaseUrl: "http://localhost:5080",
    });
    mockFetchAdminSessionHttp.mockResolvedValueOnce(null);
    mockLoginAdminHttp.mockResolvedValueOnce({ username: "admin" });
    mockLogoutAdminHttp.mockResolvedValueOnce(undefined);

    await fetchAdminSession();
    await loginAdmin("admin", "password123");
    await logoutAdmin();

    expect(mockFetchAdminSessionHttp).toHaveBeenCalled();
    expect(mockLoginAdminHttp).toHaveBeenCalledWith("admin", "password123");
    expect(mockLogoutAdminHttp).toHaveBeenCalled();
    expect(mockFetchAdminSessionMock).not.toHaveBeenCalled();
  });
});
