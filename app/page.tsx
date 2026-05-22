import Link from "next/link";
import { ArticleCard } from "@/components/home/article-card";
import { ReadingContainer } from "@/components/typography/reading-container";
import { getRecentPosts } from "@/src/lib/posts/queries";
import { getAllTags } from "@/src/lib/tags/actions";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tag } = await searchParams;
  const articles = await getRecentPosts(20);
  const allTags = await getAllTags();
  const latestSlug = articles[0]?.slug;

  // Filter by tag if specified
  const filteredArticles = tag
    ? articles.filter((article) => article.tags?.some((t) => t.slug === tag))
    : articles;

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
          <div className="flex flex-col gap-4 border-b border-border pb-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted">
                {tag ? `Tagged with "${allTags.find((t) => t.slug === tag)?.name || tag}"` : "Recent"}
              </h2>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="font-sans text-xs text-muted">Filter by tag:</span>
                {allTags.map((t) => (
                  <a
                    key={t.id}
                    href={`/?tag=${t.slug}`}
                    className={`rounded-full border px-2.5 py-0.5 font-sans text-xs transition-colors ${
                      tag === t.slug
                        ? "border-accent bg-accent text-background"
                        : "border-border bg-muted-surface text-muted hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {t.name}
                  </a>
                ))}
                {tag && (
                  <a
                    href="/"
                    className="font-sans text-xs text-accent underline-offset-4 hover:underline"
                  >
                    Clear filter
                  </a>
                )}
              </div>
            )}
          </div>
          <div>
            {filteredArticles.length === 0 ? (
              <p className="py-16 font-sans text-sm text-muted">
                {tag ? "No posts found with this tag." : "No posts yet. "}
                <Link href="/submit" className="font-medium text-accent underline-offset-2 hover:underline">
                  Publish your first Google Doc
                </Link>
                .
              </p>
            ) : (
              filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))
            )}
          </div>
        </ReadingContainer>
      </section>
    </div>
  );
}
