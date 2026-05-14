import slugify from "slugify";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/lib/supabase/client";

export function slugFromTitle(title: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  return base || "post";
}

export async function allocateUniqueSlug(
  supabase: SupabaseClient<Database>,
  title: string,
): Promise<string> {
  const base = slugFromTitle(title);
  let candidate = base;
  for (let n = 0; n < 50; n++) {
    const { data, error } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not verify slug uniqueness: ${error.message}`);
    }

    if (!data) {
      return candidate;
    }

    candidate = `${base}-${n + 2}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}
