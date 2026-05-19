# Security Checklist

This checklist captures the current security baseline for the local-development admin surface.

## Configuration

- Keep real secrets in `.env`, `.env.local`, user-secrets, or deployment secrets only.
- Keep `.env.example` and `appsettings*.json` free from real credentials.
- Configure `Cors:AllowedOrigins` with explicit trusted origins only. Do not use `*` with credentials.
- Keep `Admin:AllowApiKeyFallback` disabled outside local development or one-off scripted testing.

## Admin Authentication

- Store admin passwords as PBKDF2 hashes in `Admin:PasswordHash`.
- Prefer `ADMIN_PASSWORD_HASH='pbkdf2-sha256$...'` in `.env` because hashes contain `$`.
- Use the HTTP-only admin session cookie for browser admin access.
- Treat `X-Admin-Api-Key` as a local fallback path, not as the normal browser auth path.

## Request Protection

- Browser admin writes use `X-CSRF-Token` together with the HTTP-only session cookie.
- CSRF tokens are returned from `POST /api/auth/login` and `GET /api/auth/me`, then sent on admin `POST`, `PUT`, `DELETE`, and `POST /api/auth/logout`.
- Login is rate limited separately from admin API traffic.
- Admin API endpoints are rate limited to reduce accidental loops and low-effort abuse.

## Before Deployment

- Set production origins in `Cors:AllowedOrigins`.
- Set `Admin:AllowApiKeyFallback=false`.
- Use HTTPS so the admin session cookie is always marked secure.
- Put the API behind deployment-level request size limits and TLS termination.
- Review logs for repeated auth failures and rate-limit responses.
