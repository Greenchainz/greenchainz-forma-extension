/**
 * Token management for GreenChainz RFQ authentication.
 * Stores and retrieves auth token for API calls requiring Bearer auth.
 */

const TOKEN_STORAGE_KEY = "gc-auth-token-v1";

export interface AuthState {
  token: string | null;
  isLinked: boolean;
  lastVerified: number | null;
}

/**
 * Get stored auth token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Save auth token to localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.warn("Could not save auth token:", err);
  }
}

/**
 * Clear auth token (user logout)
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // silent
  }
}

/**
 * Verify token is still valid by attempting a simple API call.
 * Returns true if token works, false if invalid/expired.
 */
export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(
      (import.meta.env.VITE_GC_API_URL ?? "https://greenchainz.com") + "/api/public/auth/verify",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get full auth state
 */
export function getAuthState(): AuthState {
  const token = getAuthToken();
  return {
    token,
    isLinked: !!token,
    lastVerified: token ? Date.now() : null,
  };
}

/**
 * Generate a link to GreenChainz for user to authenticate and grant RFQ permissions
 */
export function getGreenChainzAuthUrl(callbackUrl: string): string {
  const base = import.meta.env.VITE_GC_API_URL ?? "https://greenchainz.com";
  const params = new URLSearchParams({
    redirect_uri: callbackUrl,
    scope: "rfq:write",
    response_type: "token",
  });
  return `${base}/auth/connect?${params.toString()}`;
}
