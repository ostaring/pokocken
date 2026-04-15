import type { AdminSession } from "../../types/auth";
import { resolveAppConfig } from "../config";
import { fetchAdminSessionHttp, loginAdminHttp, logoutAdminHttp } from "./http/auth-adapter";
import { fetchAdminSessionMock, loginAdminMock, logoutAdminMock } from "./mock/auth-adapter";

function useHttpApi() {
  return resolveAppConfig().apiMode === "http";
}

export async function fetchAdminSession(): Promise<AdminSession | null> {
  return useHttpApi() ? fetchAdminSessionHttp() : fetchAdminSessionMock();
}

export async function loginAdmin(username: string, password: string): Promise<AdminSession> {
  return useHttpApi() ? loginAdminHttp(username, password) : loginAdminMock(username, password);
}

export async function logoutAdmin(): Promise<void> {
  return useHttpApi() ? logoutAdminHttp() : logoutAdminMock();
}
