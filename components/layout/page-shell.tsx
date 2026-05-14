import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
