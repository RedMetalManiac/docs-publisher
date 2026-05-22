"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { toggleReaction, getReactionState, type ReactionType } from "@/src/lib/reactions/actions";
import { getUserIdentifier } from "@/src/lib/reactions/user-identifier";

type ReactionButtonsProps = {
  postId: string;
  initialLikeCount?: number;
  initialDislikeCount?: number;
};

export function ReactionButtons({
  postId,
  initialLikeCount = 0,
  initialDislikeCount = 0,
}: ReactionButtonsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReactionState() {
      const userIdentifier = getUserIdentifier();
      if (!userIdentifier) return;

      const state = await getReactionState(postId, userIdentifier);
      setLikeCount(state.likeCount || 0);
      setDislikeCount(state.dislikeCount || 0);
      setUserReaction(state.userReaction || null);
      setLoading(false);
    }
    loadReactionState();
  }, [postId]);

  async function handleReaction(reactionType: ReactionType) {
    const userIdentifier = getUserIdentifier();
    if (!userIdentifier) return;

    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("reactionType", reactionType);
    formData.append("userIdentifier", userIdentifier);

    const result = await toggleReaction(postId, reactionType, userIdentifier);

    if (result.success && result.likeCount !== undefined && result.dislikeCount !== undefined) {
      setLikeCount(result.likeCount);
      setDislikeCount(result.dislikeCount);
      setUserReaction(result.userReaction || null);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleReaction("like")}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs transition-colors ${
          userReaction === "like"
            ? "border-accent bg-accent text-background"
            : "border-border bg-muted-surface text-muted hover:border-accent hover:text-foreground"
        } disabled:opacity-50`}
        aria-label="Like"
      >
        <svg
          className="h-4 w-4"
          fill={userReaction === "like" ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
        <span>{likeCount}</span>
      </button>

      <button
        onClick={() => handleReaction("dislike")}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs transition-colors ${
          userReaction === "dislike"
            ? "border-accent bg-accent text-background"
            : "border-border bg-muted-surface text-muted hover:border-accent hover:text-foreground"
        } disabled:opacity-50`}
        aria-label="Dislike"
      >
        <svg
          className="h-4 w-4"
          fill={userReaction === "dislike" ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          />
        </svg>
        <span>{dislikeCount}</span>
      </button>
    </div>
  );
}
