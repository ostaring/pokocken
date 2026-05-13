import { resolveAppConfig } from "@/lib/config/config";

export function buildApiUrl(path: string, baseUrl = resolveAppConfig().apiBaseUrl) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}
