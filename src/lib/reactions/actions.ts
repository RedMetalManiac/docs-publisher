"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export type ReactionType = "like" | "dislike";

export type ReactionState = {
  error?: string;
  success?: boolean;
  likeCount?: number;
  dislikeCount?: number;
  userReaction?: ReactionType | null;
};

/**
 * Get reaction counts for a post
 */
export async function getReactionCounts(postId: string): Promise<{
  likeCount: number;
  dislikeCount: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reactions")
    .select("reaction_type")
    .eq("post_id", postId);

  if (error) {
    console.error("[reactions] getReactionCounts", error.message);
    return { likeCount: 0, dislikeCount: 0 };
  }

  const likeCount = data?.filter((r) => r.reaction_type === "like").length || 0;
  const dislikeCount = data?.filter((r) => r.reaction_type === "dislike").length || 0;

  return { likeCount, dislikeCount };
}

/**
 * Get user's reaction for a post (based on user identifier)
 */
export async function getUserReaction(
  postId: string,
  userIdentifier: string,
): Promise<ReactionType | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reactions")
    .select("reaction_type")
    .eq("post_id", postId)
    .eq("user_identifier", userIdentifier)
    .single();

  if (error || !data) {
    return null;
  }

  return data.reaction_type as ReactionType;
}

/**
 * Toggle a reaction (add if not exists, remove if exists)
 */
export async function toggleReaction(
  postId: string,
  reactionType: ReactionType,
  userIdentifier: string,
): Promise<ReactionState> {
  const supabase = await createClient();

  // Check if user already has this reaction
  const { data: existingReaction } = await supabase
    .from("reactions")
    .select("id, reaction_type")
    .eq("post_id", postId)
    .eq("user_identifier", userIdentifier)
    .eq("reaction_type", reactionType)
    .single();

  if (existingReaction) {
    // Remove the reaction (toggle off)
    const { error: deleteError } = await supabase
      .from("reactions")
      .delete()
      .eq("id", existingReaction.id);

    if (deleteError) {
      return { error: deleteError.message };
    }
  } else {
    // Check if user has the opposite reaction
    const { data: oppositeReaction } = await supabase
      .from("reactions")
      .select("id")
      .eq("post_id", postId)
      .eq("user_identifier", userIdentifier)
      .eq(
        "reaction_type",
        reactionType === "like" ? "dislike" : "like",
      )
      .single();

    if (oppositeReaction) {
      // Remove opposite reaction first
      await supabase
        .from("reactions")
        .delete()
        .eq("id", oppositeReaction.id);
    }

    // Add the new reaction
    const { error: insertError } = await supabase.from("reactions").insert({
      post_id: postId,
      reaction_type: reactionType,
      user_identifier: userIdentifier,
    });

    if (insertError) {
      return { error: insertError.message };
    }
  }

  // Get updated counts
  const counts = await getReactionCounts(postId);
  const userReaction = await getUserReaction(postId, userIdentifier);

  // Revalidate the article page
  revalidatePath(`/article/${postId}`);

  return {
    success: true,
    likeCount: counts.likeCount,
    dislikeCount: counts.dislikeCount,
    userReaction,
  };
}

/**
 * Get reaction counts and user reaction in one call
 */
export async function getReactionState(
  postId: string,
  userIdentifier: string,
): Promise<ReactionState> {
  const counts = await getReactionCounts(postId);
  const userReaction = await getUserReaction(postId, userIdentifier);

  return {
    likeCount: counts.likeCount,
    dislikeCount: counts.dislikeCount,
    userReaction,
  };
}
