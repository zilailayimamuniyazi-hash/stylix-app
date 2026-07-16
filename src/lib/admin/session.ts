const COOKIE_NAME = "stylix_admin_session";

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function getExpectedAdminSession() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!password || !secret) return null;
  return digest(`${password}:${secret}:stylix-admin-v1`);
}

export async function hasAdminSession(request: { cookies: { get(name: string): { value: string } | undefined } }) {
  const expected = await getExpectedAdminSession();
  const actual = request.cookies.get(COOKIE_NAME)?.value;
  return Boolean(expected && actual && expected === actual);
}

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;
