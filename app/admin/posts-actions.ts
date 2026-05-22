"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { verifyAdminSession } from "@/src/lib/admin/auth";
import { associateTagsWithPost } from "@/src/lib/tags/actions";

export type PostUpdateData = {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  author?: string;
  published?: boolean;
  tags?: string;
};

export type PostActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action to delete a post
 * Requires admin authentication
 */
export async function deletePost(postId: string): Promise<PostActionResult> {
  // Verify admin authentication
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the admin dashboard and homepage
  revalidatePath("/admin");
  revalidatePath("/");

  return { success: true };
}

/**
 * Server Action to update post metadata
 * Requires admin authentication
 */
export async function updatePostMetadata(
  data: PostUpdateData,
): Promise<PostActionResult> {
  // Verify admin authentication
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  const updateData: {
    title?: string;
    slug?: string;
    excerpt?: string;
    author?: string;
    published?: boolean;
  } = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    author: data.author,
    published: data.published,
  };

  // Remove undefined values
  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  const { error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", data.id);

  if (error) {
    return { error: error.message };
  }

  // Update tags if provided
  if (data.tags !== undefined) {
    const tagNames = data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const tagResult = await associateTagsWithPost(data.id, tagNames);
    if (tagResult.error) {
      return { error: tagResult.error };
    }
  }

  // Revalidate the admin dashboard and homepage
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/article/${data.slug}`);

  return { success: true };
}

/**
 * Server Action to get all posts for the admin dashboard
 * Requires admin authentication
 */
export async function getAllPostsForAdmin() {
  // Verify admin authentication
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }

  return data;
}
