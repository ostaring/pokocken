let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token?.trim() ? token : null;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export function buildCsrfHeaders(): Record<string, string> {
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
}
