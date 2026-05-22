export type Article = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  excerpt: string;
  body: string[];
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

/** Fields used by homepage cards and similar list UIs. */
export type ArticleListItem = Pick<
  Article,
  "slug" | "title" | "excerpt" | "publishedAt" | "readTimeMinutes"
> & {
  tags?: Tag[];
  commentCount?: number;
  likeCount?: number;
  dislikeCount?: number;
};
