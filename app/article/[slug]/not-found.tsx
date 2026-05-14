import Link from "next/link";
import { ReadingContainer } from "@/components/typography/reading-container";

export default function ArticleNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24">
      <ReadingContainer className="text-center">
        <h1 className="font-serif text-2xl text-foreground sm:text-3xl">
          This story is not here
        </h1>
        <p className="mt-3 font-sans text-muted">
          The link may be wrong, or the piece was removed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex font-sans text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </ReadingContainer>
    </div>
  );
}
