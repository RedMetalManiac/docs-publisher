import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingContainer } from "@/components/typography/reading-container";
import { sanitizeArticleHtml } from "@/src/lib/parser/google-docs-parser";
import { getPostBySlug } from "@/src/lib/posts/queries";
import { CommentsSidebar } from "@/components/comments/comments-sidebar";
import { getTagsForPost } from "@/src/lib/tags/actions";
import { ReactionButtons } from "@/components/reactions/reaction-buttons";
import { getReactionCounts } from "@/src/lib/reactions/actions";
import { getCommentCount } from "@/src/lib/comments/actions";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Article" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const safeHtml = sanitizeArticleHtml(post.content_html);
  const tags = await getTagsForPost(post.id);
  const reactionCounts = await getReactionCounts(post.id);
  const commentCount = await getCommentCount(post.id);

  return (
    <div className="flex flex-1 flex-col pb-20 pt-12 sm:pt-16 lg:pt-20">
      <ReadingContainer>
        <Link
          href="/"
          className="inline-flex font-sans text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          ← Home
        </Link>

        <header className="mt-10 text-center sm:mt-12">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-sm text-muted">
            <span>{post.author}</span>
            <span aria-hidden className="text-muted/50">
              ·
            </span>
            <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            <span aria-hidden className="text-muted/50">
              ·
            </span>
            <span>{post.read_time_minutes} min read</span>
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-[2rem] font-normal leading-tight tracking-tight text-foreground sm:text-4xl sm:leading-[1.15] lg:text-[2.75rem]">
            {post.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-xl font-normal leading-snug text-muted sm:text-2xl sm:leading-snug">
            {post.excerpt}
          </p>
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="rounded-full border border-border bg-muted-surface px-3 py-1 font-sans text-xs text-muted transition-colors hover:bg-border hover:text-foreground"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 font-sans text-sm text-muted">
            <ReactionButtons
              postId={post.id}
              initialLikeCount={reactionCounts.likeCount}
              initialDislikeCount={reactionCounts.dislikeCount}
            />
            <span className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{commentCount} comment{commentCount !== 1 ? "s" : ""}</span>
            </span>
          </div>
        </header>
      </ReadingContainer>

      <div className="mx-auto mt-14 w-full max-w-reading border-t border-border px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </div>

      <CommentsSidebar postId={post.id} />
    </div>
  );
}
