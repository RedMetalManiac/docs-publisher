import { searchPosts } from "@/src/lib/search/actions";
import { ArticleCard } from "@/components/home/article-card";
import { ReadingContainer } from "@/components/typography/reading-container";
import { getAllTags } from "@/src/lib/tags/actions";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, tag } = await searchParams;
  const query = q || "";
  const results = await searchPosts(query);
  const allTags = await getAllTags();

  // Filter by tag if specified
  const filteredResults = tag
    ? results.filter((article) =>
        article.tags?.some((t) => t.slug === tag),
      )
    : results;

  return (
    <div className="flex flex-1 flex-col pb-20 pt-12 sm:pt-16 lg:pt-20">
      <ReadingContainer>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
        <p className="mt-2 font-sans text-sm text-muted">
          {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
        </p>
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="font-sans text-sm text-muted">Filter by tag:</span>
            {allTags.map((t) => (
              <a
                key={t.id}
                href={`/search?q=${encodeURIComponent(query)}&tag=${t.slug}`}
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
                href={`/search?q=${encodeURIComponent(query)}`}
                className="font-sans text-xs text-accent underline-offset-4 hover:underline"
              >
                Clear filter
              </a>
            )}
          </div>
        )}
      </ReadingContainer>

      {filteredResults.length === 0 ? (
        <div className="mx-auto mt-12 max-w-content-wide px-4 sm:px-6 lg:px-8">
          <p className="font-sans text-muted">
            {query
              ? "No results found. Try a different search term or filter."
              : "Enter a search term to find articles."}
          </p>
        </div>
      ) : (
        <div className="mx-auto mt-12 max-w-content-wide px-4 sm:px-6 lg:px-8">
          {filteredResults.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
