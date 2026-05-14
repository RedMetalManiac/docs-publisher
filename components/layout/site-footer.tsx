import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-content-wide flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-sans text-sm text-muted">
          © {year} Docs Publisher. A calm place for long-form writing.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm">
          <Link
            href="/submit"
            className="text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Submit a story
          </Link>
          <span className="text-muted/60" aria-hidden>
            ·
          </span>
          <span className="text-muted">No ads. No noise.</span>
        </div>
      </div>
    </footer>
  );
}
