import type { AdminSession } from "@/types/auth/auth";
import { buildApiUrl } from "@/lib/api/shared/http-client";
import { buildCsrfHeaders, clearCsrfToken, setCsrfToken } from "@/lib/api/shared/csrf-token";

export async function fetchAdminSessionHttp(): Promise<AdminSession | null> {
  const response = await fetch(buildApiUrl("/api/auth/me"), {
    credentials: "include",
  });

  if (response.status === 401) {
    clearCsrfToken();
    return null;
  }

  if (!response.ok) {
    throw new Error("Kunde inte hämta adminsessionsdata.");
  }

  const session = (await response.json()) as AdminSession;
  setCsrfToken(session.csrfToken);
  return session;
}

export async function loginAdminHttp(username: string, password: string): Promise<AdminSession> {
  const response = await fetch(buildApiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Fel användarnamn eller lösenord.");
  }

  const session = (await response.json()) as AdminSession;
  setCsrfToken(session.csrfToken);
  return session;
}

export async function logoutAdminHttp(): Promise<void> {
  const response = await fetch(buildApiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
  });

  if (!response.ok) {
    throw new Error("Kunde inte logga ut.");
  }

  clearCsrfToken();
}
