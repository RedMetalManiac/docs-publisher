import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Get the admin session token from cookies
 */
export async function getAdminSession(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
}

/**
 * Set the admin session cookie (HTTP-only, secure, same-site)
 */
export async function setAdminSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear the admin session cookie
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Verify if the current session is valid
 * This checks if the session token matches the expected value
 */
export async function verifyAdminSession(): Promise<boolean> {
  const session = await getAdminSession();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!session || !adminPassword) {
    return false;
  }

  // The session token is a hash of the admin password
  // We verify by comparing the provided password hash
  const expectedToken = await hashPassword(adminPassword);
  return session === expectedToken;
}

/**
 * Create a session token from the admin password
 */
export async function createSessionToken(password: string): Promise<string> {
  return await hashPassword(password);
}

/**
 * Simple hash function for the admin password
 * Using Web Crypto API for a secure hash
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "admin_session_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
