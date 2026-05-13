import type { AdminSession } from "@/types/auth/auth";
import { apiDelay } from "@/lib/api/shared/client";

const AUTH_STORAGE_KEY = "recipe-app-admin-session";

function readStoredSession(): AdminSession | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export async function fetchAdminSessionMock(): Promise<AdminSession | null> {
  await apiDelay();
  return readStoredSession();
}

export async function loginAdminMock(username: string, password: string): Promise<AdminSession> {
  await apiDelay();

  if (username !== "admin" || password !== "password123") {
    throw new Error("Invalid username or password.");
  }

  const session = { username };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function logoutAdminMock(): Promise<void> {
  await apiDelay();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
