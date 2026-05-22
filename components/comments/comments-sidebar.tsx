"use client";

import { useState, useEffect, useCallback } from "react";
import { addComment, getCommentsForPost, type CommentState } from "@/src/lib/comments/actions";
import { useActionState } from "react";

type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

type CommentsSidebarProps = {
  postId: string;
};

export function CommentsSidebar({ postId }: CommentsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const data = await getCommentsForPost(postId);
    setComments(data || []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, loadComments]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg border-l border-t border-b border-border bg-surface px-3 py-4 font-sans text-xs font-medium uppercase tracking-wider text-muted shadow-lg transition-all hover:bg-muted-surface hover:text-foreground sm:right-0"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(0)",
        }}
      >
        {isOpen ? "×" : "Comments"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 z-30 h-full w-full border-l border-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out sm:w-96 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-serif text-xl font-normal text-foreground">
              Comments
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="font-sans text-sm text-muted transition-colors hover:text-foreground"
            >
              Close
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <p className="font-sans text-sm text-muted">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="font-sans text-sm text-muted">No comments yet.</p>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border pb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {comment.author_name}
                      </span>
                      <span className="font-sans text-xs text-muted">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-foreground">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t border-border px-6 py-4">
            <CommentForm postId={postId} onCommentAdded={loadComments} />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function CommentForm({
  postId,
  onCommentAdded,
}: {
  postId: string;
  onCommentAdded: () => void;
}) {
  const [state, formAction] = useActionState<CommentState, FormData>(
    addComment,
    {},
  );

  useEffect(() => {
    if (state.success) {
      onCommentAdded();
    }
  }, [state.success, onCommentAdded]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="post_id" value={postId} />
      <div>
        <input
          type="text"
          name="author_name"
          required
          placeholder="Your name"
          maxLength={100}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <textarea
          name="content"
          required
          placeholder="Add a comment..."
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
        />
      </div>
      {state.error && (
        <p className="font-sans text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        className="w-full rounded-full bg-foreground px-4 py-2 font-sans text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Post Comment
      </button>
    </form>
  );
}
