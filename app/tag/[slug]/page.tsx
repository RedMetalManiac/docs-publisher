import { notFound } from "next/navigation";
import { getPostsByTag } from "@/src/lib/tags/actions";
import { ArticleCard } from "@/components/home/article-card";
import { ReadingContainer } from "@/components/typography/reading-container";

export const dynamic = "force-dynamic";

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const posts = await getPostsByTag(slug);

  if (!posts || posts.length === 0) {
    notFound();
  }

  const tagName = posts[0].tags?.[0]?.name || slug;

  return (
    <div className="flex flex-1 flex-col pb-20 pt-12 sm:pt-16 lg:pt-20">
      <ReadingContainer>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
          Tagged with "{tagName}"
        </h1>
        <p className="mt-2 font-sans text-sm text-muted">
          {posts.length} article{posts.length !== 1 ? "s" : ""} found
        </p>
      </ReadingContainer>

      <div className="mx-auto mt-12 max-w-content-wide px-4 sm:px-6 lg:px-8">
        {posts.map((post) => (
          <ArticleCard
            key={post.id}
            article={{
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              publishedAt: post.created_at,
              readTimeMinutes: post.read_time_minutes,
              tags: post.tags || [],
            }}
          />
        ))}
      </div>
    </div>
  );
}
