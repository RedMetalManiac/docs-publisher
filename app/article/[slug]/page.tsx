import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProseArticle } from "@/components/typography/prose-article";
import { ReadingContainer } from "@/components/typography/reading-container";
import {
  getAllSlugs,
  getArticleBySlug,
} from "@/lib/articles";

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

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return { title: "Article" };
  }
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="flex flex-1 flex-col pb-20 pt-12 sm:pt-16 lg:pt-20">
      <ReadingContainer>
        <Link
          href="/"
          className="inline-flex font-sans text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          ← Home
        </Link>

        <header className="mt-10 text-center sm:mt-12">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-sm text-muted">
            <span>{article.author}</span>
            <span aria-hidden className="text-muted/50">
              ·
            </span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span aria-hidden className="text-muted/50">
              ·
            </span>
            <span>{article.readTimeMinutes} min read</span>
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-[2rem] font-normal leading-tight tracking-tight text-foreground sm:text-4xl sm:leading-[1.15] lg:text-[2.75rem]">
            {article.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-xl font-normal leading-snug text-muted sm:text-2xl sm:leading-snug">
            {article.subtitle}
          </p>
        </header>
      </ReadingContainer>

      <div className="mx-auto mt-14 w-full max-w-reading border-t border-border px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
        <ProseArticle>
          {article.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </ProseArticle>
      </div>
    </article>
  );
}
