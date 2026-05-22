"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import sanitizeHtml from "sanitize-html";

export type CommentState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action to add a comment to a post
 */
export async function addComment(
  _prevState: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const postId = formData.get("post_id")?.toString();
  const authorName = formData.get("author_name")?.toString().trim();
  const content = formData.get("content")?.toString().trim();

  if (!postId || !authorName || !content) {
    return { error: "All fields are required" };
  }

  if (authorName.length > 100) {
    return { error: "Name must be less than 100 characters" };
  }

  if (content.length > 2000) {
    return { error: "Comment must be less than 2000 characters" };
  }

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });

  const supabase = await createClient();

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_name: authorName,
    content: sanitizedContent,
  });

  if (error) {
    return { error: error.message };
  }

  // Revalidate the article page
  revalidatePath(`/article/${postId}`);

  return { success: true };
}

/**
 * Server Action to fetch comments for a post
 */
export async function getCommentsForPost(postId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data;
}

/**
 * Server Action to get comment count for a post
 */
export async function getCommentCount(postId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    console.error("[comments] getCommentCount", error.message);
    return 0;
  }

  return count || 0;
}
