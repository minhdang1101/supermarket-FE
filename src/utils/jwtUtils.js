/**
 * Decode JWT payload without verification (server verifies on each request).
 * Client-side role is used only for UI gating; tampering affects display but server
 * will reject API calls with invalid tokens.
 * @param {string} token - JWT token
 * @returns {{ role?: string, sub?: string, exp?: number } | null}
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Get role from JWT token for client-side UI gating.
 * @param {string} token - JWT token from tokenStore (in-memory)
 * @returns {string | null}
 */
export function getRoleFromToken(token) {
  const payload = decodeJwtPayload(token);
  return payload?.role ?? null;
}
