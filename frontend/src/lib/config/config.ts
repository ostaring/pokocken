export type ApiMode = "mock" | "http";

export type AppConfig = {
  apiMode: ApiMode;
  apiBaseUrl: string;
};

type AppEnv = {
  [key: string]: unknown;
  VITE_API_MODE?: string;
  VITE_API_BASE_URL?: string;
};

export function resolveAppConfig(env: AppEnv = import.meta.env): AppConfig {
  return {
    apiMode: env.VITE_API_MODE === "http" ? "http" : "mock",
    apiBaseUrl: env.VITE_API_BASE_URL?.trim() || "http://localhost:5080",
  };
}
