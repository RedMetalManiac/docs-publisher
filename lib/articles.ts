import type { Article } from "@/types/article";

const articles: Article[] = [
  {
    slug: "on-quiet-writing",
    title: "On quiet writing",
    subtitle:
      "Why the best drafts often arrive when you stop chasing the algorithm.",
    author: "Editorial",
    publishedAt: "2026-05-01",
    readTimeMinutes: 6,
    excerpt:
      "A short note about patience, rhythm, and letting sentences find their own weight.",
    body: [
      "There is a particular stillness that good writing asks for—not silence in the room, but silence in the mind. You stop explaining yourself to an imagined panel of judges and start listening to the sentence in front of you.",
      "Most tools want you to move faster. A blank page wants the opposite. It rewards the slow accumulation of detail: the right verb, the honest admission, the image that only you would notice.",
      "If you are building a place for words, build it like a reading room: generous margins, calm type, nothing that shouts over the author. The interface should disappear the moment someone begins to read.",
    ],
  },
  {
    slug: "letters-from-the-margin",
    title: "Letters from the margin",
    subtitle: "Notes on design, typography, and the shape of attention.",
    author: "Editorial",
    publishedAt: "2026-04-18",
    readTimeMinutes: 8,
    excerpt:
      "How line length, contrast, and rhythm change the way we receive ideas.",
    body: [
      "Readers do not experience typography as a set of rules. They experience it as comfort or friction. Too wide a measure and the eye tires; too narrow and the prose feels breathless.",
      "Contrast is not drama for its own sake. It is hierarchy: what matters now, what can wait, what belongs in the background. Dark mode is not a theme toggle—it is a different room with different light.",
      "When in doubt, subtract. The platforms we admire tend to share one habit: they refuse to decorate every corner. They leave space for the reader to meet the text halfway.",
    ],
  },
  {
    slug: "the-first-draft-is-a-map",
    title: "The first draft is a map",
    subtitle: "Editing as discovery, not demolition.",
    author: "Editorial",
    publishedAt: "2026-04-02",
    readTimeMinutes: 5,
    excerpt:
      "Treat revision as cartography: you are not erasing the territory, you are drawing it more clearly.",
    body: [
      "First drafts are supposed to be imperfect. Their job is to prove that a path exists from the opening question to some kind of landing. You are allowed to walk that path badly before you walk it well.",
      "Revision is where generosity enters. You cut what confuses, you sharpen what hesitates, you let the reader feel the shape of your thinking without tripping over the scaffolding.",
      "Ship the map when it is honest. Perfection is a moving target; clarity is something you can recognize when you see it.",
    ],
  },
];

const bySlug = new Map(articles.map((a) => [a.slug, a]));

export function getArticleBySlug(slug: string): Article | undefined {
  return bySlug.get(slug);
}

export function getAllArticles(): Article[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}
