import Link from "next/link";
import { ArticleCard } from "@/components/home/article-card";
import { ReadingContainer } from "@/components/typography/reading-container";
import { getRecentPosts } from "@/src/lib/posts/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getRecentPosts(20);
  const latestSlug = articles[0]?.slug;

  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-border bg-surface py-16 sm:py-20 lg:py-24">
        <ReadingContainer>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Reader first
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            Ideas deserve quiet pages and room to breathe.
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-muted sm:text-xl">
            Essays, stories, and papers—published for free, directly from google docs
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-7 font-sans text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Submit a story
            </Link>
            {latestSlug ? (
              <Link
                href={`/article/${latestSlug}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-7 font-sans text-sm font-medium text-foreground transition-colors hover:bg-muted-surface"
              >
                Read the latest
              </Link>
            ) : null}
          </div>
        </ReadingContainer>
      </section>

      <section className="flex-1 bg-background py-4 sm:py-6">
        <ReadingContainer>
          <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted">
              Recent
            </h2>
          </div>
          <div>
            {articles.length === 0 ? (
              <p className="py-16 font-sans text-sm text-muted">
                No posts yet.{" "}
                <Link href="/submit" className="font-medium text-accent underline-offset-2 hover:underline">
                  Publish your first Google Doc
                </Link>
                .
              </p>
            ) : (
              articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))
            )}
          </div>
        </ReadingContainer>
      </section>
    </div>
  );
}
