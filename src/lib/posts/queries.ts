import { createClient } from "@/src/lib/supabase/server";
import type { ArticleListItem, Tag } from "@/types/article";
import { getCommentCount } from "@/src/lib/comments/actions";
import { getReactionCounts } from "@/src/lib/reactions/actions";

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

export type PostWithPostTags = PostRow & {
  post_tags: {
    tags: Tag;
  }[];
};

export type PostWithTags = PostRow & {
  tags: Tag[];
};

function rowToListItem(row: PostWithTags, commentCount?: number, likeCount?: number, dislikeCount?: number): ArticleListItem {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.created_at,
    readTimeMinutes: row.read_time_minutes,
    tags: row.tags,
    commentCount,
    likeCount,
    dislikeCount,
  };
}

export async function getRecentPosts(limit = 20): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content_html, author, source_url, read_time_minutes, created_at, post_tags(tags(id, name, slug))",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[posts] getRecentPosts", error.message);
    return [];
  }

  const postsWithTags = (data as PostWithPostTags[] | null)?.map((post) => ({
    ...post,
    tags: post.post_tags?.map((pt) => pt.tags).filter(Boolean) || [],
  })) ?? [];

  // Fetch comment and reaction counts for all posts
  const postsWithCounts = await Promise.all(
    postsWithTags.map(async (post) => {
      const [commentCount, reactionCounts] = await Promise.all([
        getCommentCount(post.id),
        getReactionCounts(post.id),
      ]);
      return {
        ...post,
        commentCount,
        likeCount: reactionCounts.likeCount,
        dislikeCount: reactionCounts.dislikeCount,
      };
    })
  );

  return postsWithCounts.map((post) =>
    rowToListItem(
      post,
      post.commentCount,
      post.likeCount,
      post.dislikeCount,
    )
  );
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
