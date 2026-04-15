import type { AdminSession } from "../../../types/auth";
import { buildApiUrl } from "../http-client";

export async function fetchAdminSessionHttp(): Promise<AdminSession | null> {
  const response = await fetch(buildApiUrl("/api/auth/me"), {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Kunde inte hämta adminsessionsdata.");
  }

  return (await response.json()) as AdminSession;
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

  return (await response.json()) as AdminSession;
}

export async function logoutAdminHttp(): Promise<void> {
  const response = await fetch(buildApiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Kunde inte logga ut.");
  }
}
