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
      <Link
        href={`/article/${article.slug}`}
        className="mt-4 inline-flex font-sans text-sm font-medium text-accent underline-offset-4 group-hover:underline"
      >
        Read more
      </Link>
    </article>
  );
}
