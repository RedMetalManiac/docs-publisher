"use server";

import { createClient } from "@/src/lib/supabase/server";
import type { ArticleListItem, Tag } from "@/types/article";

export type SearchResult = ArticleListItem;

/**
 * Server Action to search posts by title, excerpt, tags, and author
 */
export async function searchPosts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const supabase = await createClient();
  const searchTerm = `%${query.trim()}%`;

  // Search in title, excerpt, and author
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content_html, author, source_url, read_time_minutes, created_at, post_tags(tags(id, name, slug))",
    )
    .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},author.ilike.${searchTerm}`)
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("[search] searchPosts", postsError.message);
    return [];
  }

  // Also search by tag names
  const { data: tagsData, error: tagsError } = await supabase
    .from("tags")
    .select("name, slug, post_tags(posts(id, slug, title, excerpt, author, read_time_minutes, created_at))")
    .ilike("name", searchTerm);

  if (tagsError) {
    console.error("[search] searchPosts tags", tagsError.message);
  }

  // Combine results
  const results = new Map<string, SearchResult>();

  // Add posts from direct search
  if (postsData) {
    postsData.forEach((post: any) => {
      const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
      results.set(post.id, {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        publishedAt: post.created_at,
        readTimeMinutes: post.read_time_minutes,
        tags,
      });
    });
  }

  // Add posts from tag search
  if (tagsData) {
    tagsData.forEach((tag: any) => {
      tag.post_tags?.forEach((pt: any) => {
        if (pt.posts && !results.has(pt.posts.id)) {
          results.set(pt.posts.id, {
            slug: pt.posts.slug,
            title: pt.posts.title,
            excerpt: pt.posts.excerpt,
            publishedAt: pt.posts.created_at,
            readTimeMinutes: pt.posts.read_time_minutes,
            tags: [{ id: tag.id, name: tag.name, slug: tag.slug }],
          });
        }
      });
    });
  }

  return Array.from(results.values());
}
