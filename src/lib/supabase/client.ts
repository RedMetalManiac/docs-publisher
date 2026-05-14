import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Database shape for typed queries. Replace with generated types:
 *   npx supabase gen types typescript --project-id <your-project-ref> --schema public
 * and paste into this file (or import from a dedicated `database.types.ts`).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content_html: string;
          author: string;
          source_url: string;
          read_time_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          content_html: string;
          author?: string;
          source_url: string;
          read_time_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          content_html?: string;
          author?: string;
          source_url?: string;
          read_time_minutes?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

/**
 * Public Supabase configuration (inlined at build time in the browser).
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
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see src/lib/supabase/client.ts).",
    );
  }

  return { url, anonKey };
}

/**
 * Supabase client for **Client Components** and other browser code.
 * Create a new instance per call (cheap; @supabase/ssr can reuse internally).
 */
export function createClient(): SupabaseClient<Database> {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
