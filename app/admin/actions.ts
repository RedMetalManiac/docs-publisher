"use server";

import { redirect } from "next/navigation";
import {
  setAdminSession,
  clearAdminSession,
  verifyAdminSession,
  createSessionToken,
} from "@/src/lib/admin/auth";

export type AdminLoginState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action for admin login
 * Validates the password and sets a secure HTTP-only cookie
 */
export async function adminLogin(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const password = formData.get("password")?.toString().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password) {
    return { error: "Password is required" };
  }

  if (!adminPassword) {
    return { error: "Admin password not configured" };
  }

  if (password !== adminPassword) {
    return { error: "Invalid password" };
  }

  // Create session token and set cookie
  const sessionToken = await createSessionToken(password);
  await setAdminSession(sessionToken);

  return { success: true };
}

/**
 * Server Action for admin logout
 * Clears the session cookie
 */
export async function adminLogout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

/**
 * Server Action to verify admin authentication
 * Returns true if authenticated, false otherwise
 */
export async function requireAdminAuth(): Promise<boolean> {
  const isAuthenticated = await verifyAdminSession();
  return isAuthenticated;
}
