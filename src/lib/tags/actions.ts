"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import slugify from "slugify";

export type TagState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action to create or get a tag by name
 */
export async function getOrCreateTag(name: string) {
  const supabase = await createClient();
  const slug = slugify(name, { lower: true, strict: true });

  // Try to find existing tag
  const { data: existingTag } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();

  if (existingTag) {
    return existingTag;
  }

  // Create new tag
  const { data, error } = await supabase
    .from("tags")
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Server Action to associate tags with a post
 */
export async function associateTagsWithPost(
  postId: string,
  tagNames: string[],
): Promise<TagState> {
  const supabase = await createClient();

  // First, remove existing tag associations for this post
  await supabase.from("post_tags").delete().eq("post_id", postId);

  // Create or get tags and associate them with the post
  for (const tagName of tagNames) {
    const tag = await getOrCreateTag(tagName.trim());
    
    const { error } = await supabase.from("post_tags").insert({
      post_id: postId,
      tag_id: tag.id,
    });

    if (error) {
      return { error: error.message };
    }
  }

  // Revalidate paths
  revalidatePath("/");
  revalidatePath(`/article/*`);

  return { success: true };
}

/**
 * Server Action to fetch tags for a post
 */
export async function getTagsForPost(postId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_tags")
    .select("tags(*)")
    .eq("post_id", postId);

  if (error) {
    return [];
  }

  return data?.map((pt) => pt.tags).filter(Boolean) || [];
}

/**
 * Server Action to fetch all tags
 */
export async function getAllTags() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return data || [];
}

/**
 * Server Action to fetch posts by tag
 */
export async function getPostsByTag(tagSlug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_tags")
    .select("posts(*, tags(*))")
    .eq("tags.slug", tagSlug);

  if (error) {
    return [];
  }

  return data?.map((pt) => pt.posts).filter(Boolean) || [];
}
