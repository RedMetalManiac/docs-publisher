import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const nav = [
  { href: "/", label: "Home" },
  { href: "/submit", label: "Submit" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-content-wide items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          Docs Publisher
        </Link>
        <nav
          className="flex flex-1 items-center justify-end gap-1 sm:gap-2"
          aria-label="Primary"
        >
          <ul className="flex items-center gap-1 sm:gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 font-sans text-sm text-muted transition-colors hover:bg-muted-surface hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
