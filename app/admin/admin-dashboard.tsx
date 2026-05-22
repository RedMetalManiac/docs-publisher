"use client";

import { useEffect, useState } from "react";
import { adminLogout } from "./actions";
import { getAllPostsForAdmin } from "./posts-actions";
import { getTagsForPost } from "@/src/lib/tags/actions";
import type { Database } from "@/src/lib/supabase/client";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const data = await getAllPostsForAdmin();
    if (data) {
      setPosts(data);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await adminLogout();
  }

  return (
    <div className="flex flex-1 flex-col py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-content-wide px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Admin
            </p>
            <h1 className="mt-4 font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
              Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md px-4 py-2 font-sans text-sm text-muted transition-colors hover:bg-muted-surface hover:text-foreground"
          >
            Sign out
          </button>
        </div>

        <div className="mt-12">
          {loading ? (
            <p className="font-sans text-sm text-muted">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="font-sans text-sm text-muted">No posts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                      Title
                    </th>
                    <th className="pb-3 font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                      Slug
                    </th>
                    <th className="pb-3 font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                      Author
                    </th>
                    <th className="pb-3 font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                      Created
                    </th>
                    <th className="pb-3 font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                      Published
                    </th>
                    <th className="pb-3 font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-border">
                      <td className="py-4 font-sans text-sm font-medium text-foreground">
                        {post.title}
                      </td>
                      <td className="py-4 font-sans text-sm text-muted">
                        {post.slug}
                      </td>
                      <td className="py-4 font-sans text-sm text-muted">
                        {post.author}
                      </td>
                      <td className="py-4 font-sans text-sm text-muted">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-sans text-sm text-muted">
                        {post.published ? "Yes" : "No"}
                      </td>
                      <td className="py-4 font-sans text-sm">
                        <button
                          onClick={() => setEditingPost(post)}
                          className="mr-3 text-accent hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingPost(post)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => {
            setEditingPost(null);
            loadPosts();
          }}
        />
      )}

      {deletingPost && (
        <DeleteConfirmDialog
          post={deletingPost}
          onClose={() => {
            setDeletingPost(null);
            loadPosts();
          }}
        />
      )}
    </div>
  );
}

function EditPostModal({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    author: post.author,
    published: post.published,
    tags: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    async function loadTags() {
      const tags = await getTagsForPost(post.id);
      setFormData((prev) => ({
        ...prev,
        tags: tags.map((t) => t.name).join(", "),
      }));
      setLoadingTags(false);
    }
    loadTags();
  }, [post.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { updatePostMetadata } = await import("./posts-actions");
    const result = await updatePostMetadata({
      id: post.id,
      ...formData,
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-lg">
        <h2 className="mb-4 font-serif text-2xl font-normal text-foreground">
          Edit Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-sm font-medium text-foreground">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-foreground">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-foreground">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-foreground">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-foreground">
              Tags <span className="font-normal text-muted">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              disabled={loadingTags}
              placeholder="design, writing, technology"
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label
              htmlFor="published"
              className="ml-2 font-sans text-sm text-foreground"
            >
              Published
            </label>
          </div>
          {error && <p className="font-sans text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 font-sans text-sm text-muted transition-colors hover:bg-muted-surface hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-foreground px-4 py-2 font-sans text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { deletePost } = await import("./posts-actions");
    await deletePost(post.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
        <h2 className="mb-4 font-serif text-2xl font-normal text-foreground">
          Delete Post
        </h2>
        <p className="font-sans text-sm text-muted">
          Are you sure you want to delete "{post.title}"? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 font-sans text-sm text-muted transition-colors hover:bg-muted-surface hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
