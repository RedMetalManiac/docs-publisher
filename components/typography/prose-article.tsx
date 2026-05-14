import type { ReactNode } from "react";

type ProseArticleProps = {
  children: ReactNode;
};

export function ProseArticle({ children }: ProseArticleProps) {
  return (
    <article className="prose-article font-serif text-lg leading-[1.75] text-foreground sm:text-[1.125rem] sm:leading-[1.8]">
      {children}
    </article>
  );
}
