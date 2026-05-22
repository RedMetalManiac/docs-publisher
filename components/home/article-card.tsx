"use client";

import Link from "next/link";
import type { ArticleListItem } from "@/types/article";

type ArticleCardProps = {
  article: ArticleListItem;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group border-b border-border py-10 first:pt-0 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <time
          dateTime={article.publishedAt}
          className="font-sans text-xs text-muted tabular-nums"
        >
          {formatDate(article.publishedAt)}
        </time>
        <span className="font-sans text-xs text-muted">
          {article.readTimeMinutes} min read
        </span>
      </div>
      <Link href={`/article/${article.slug}`} className="block focus:outline-none">
        <h2 className="mt-3 font-serif text-2xl font-normal tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-[1.75rem] sm:leading-snug">
          {article.title}
        </h2>
      </Link>
      <p className="mt-2 max-w-2xl font-sans text-base leading-relaxed text-muted">
        {article.excerpt}
      </p>
      {article.tags && article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="rounded-full border border-border bg-muted-surface px-2.5 py-0.5 font-sans text-xs text-muted transition-colors hover:bg-border hover:text-foreground"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4 font-sans text-xs text-muted">
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
          <span>{article.commentCount || 0} comment{(article.commentCount || 0) !== 1 ? "s" : ""}</span>
        </span>
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
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>{article.likeCount || 0}</span>
        </span>
      </div>
      <Link
        href={`/article/${article.slug}`}
        className="mt-4 inline-flex font-sans text-sm font-medium text-accent underline-offset-4 group-hover:underline"
      >
        Read more
      </Link>
    </article>
  );
}
