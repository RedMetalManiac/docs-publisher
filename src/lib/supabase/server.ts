import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./client";

/**
 * Public Supabase configuration (available on the server from `.env.local`).
 *
 * Add to **`.env.local`** in the project root (same folder as `package.json`):
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
 *
 * Restart `next dev` after changing env files.
 */
function getPublicSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see src/lib/supabase/server.ts).",
    );
  }

  return { url, anonKey };
}

/**
 * Supabase client for **Server Components**, **Server Actions**, and **Route Handlers**.
 * Call once per request; do not cache across requests.
 *
 * Cookie adapter is required by `@supabase/ssr` for future auth/session refresh.
 * Auth is not wired up yet; `setAll` is a no-op when cookies cannot be mutated.
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component where response cookies are not mutable.
          // Safe to ignore until auth + middleware/session refresh is implemented.
        }
      },
    },
  });
}
