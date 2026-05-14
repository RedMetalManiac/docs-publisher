import { createClient } from "@/src/lib/supabase/server";
import type { ArticleListItem } from "@/types/article";

export type PostRow = {
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

function rowToListItem(row: PostRow): ArticleListItem {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.created_at,
    readTimeMinutes: row.read_time_minutes,
  };
}

export async function getRecentPosts(limit = 20): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content_html, author, source_url, read_time_minutes, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[posts] getRecentPosts", error.message);
    return [];
  }

  return (data as PostRow[] | null)?.map(rowToListItem) ?? [];
}

export async function getPostBySlug(slug: string): Promise<PostRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content_html, author, source_url, read_time_minutes, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[posts] getPostBySlug", error.message);
    return null;
  }

  return (data as PostRow | null) ?? null;
}
