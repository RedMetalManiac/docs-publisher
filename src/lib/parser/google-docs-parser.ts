import { load, type Cheerio, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import sanitizeHtml from "sanitize-html";

type SanitizeHtmlOptions = NonNullable<Parameters<typeof sanitizeHtml>[1]>;

export type ParsedGoogleDoc = {
  /** Document title (browser title, cleaned of the “Google Docs” suffix when present). */
  title: string;
  /** Sanitized HTML wrapped in `<article class="prose-article">` for the existing reading layout. */
  html: string;
  /** Plain-text teaser derived from the article body (whitespace collapsed). */
  excerpt: string;
};

const PUBLISHED_DOC_PATH =
  /^\/document\/d\/(?:e\/)?[^/]+\/pub(?:\/|\?|#|$)/;

const DEFAULT_FETCH_HEADERS: HeadersInit = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const SANITIZE_OPTIONS: SanitizeHtmlOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "div",
    "span",
    "blockquote",
    "br",
    "hr",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "sub",
    "sup",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href", "name", "rel", "target"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    div: [],
    span: [],
    // Block-level semantics only; styling comes from `.prose-article` + globals.
    "*": [],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const isExternal = /^https?:\/\//i.test(href);
      return {
        tagName: "a",
        attribs: {
          href,
          rel: isExternal ? "noopener noreferrer" : attribs.rel,
          target: isExternal ? "_blank" : attribs.target,
        },
      };
    },
    img: (_tagName, attribs) => ({
      tagName: "img",
      attribs: {
        src: attribs.src,
        alt: attribs.alt,
        title: attribs.title,
        width: attribs.width,
        height: attribs.height,
        loading: "lazy",
      },
    }),
  },
};

function assertPublishedGoogleDocUrl(urlString: string): URL {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new GoogleDocParseError("Invalid URL.");
  }

  if (url.protocol !== "https:") {
    throw new GoogleDocParseError("Only https:// Google Doc URLs are allowed.");
  }

  if (url.hostname !== "docs.google.com") {
    throw new GoogleDocParseError("URL must be on docs.google.com.");
  }

  if (!PUBLISHED_DOC_PATH.test(url.pathname + url.search.split("&")[0])) {
    throw new GoogleDocParseError(
      "URL must be a published document (path ending in /pub). Example: https://docs.google.com/document/d/<id>/pub",
    );
  }

  return url;
}

function stripGoogleChrome($: CheerioAPI) {
  $(
    'script, style, noscript, iframe, object, embed, link[rel="stylesheet"], link[rel="preload"], base, meta[http-equiv="refresh"]',
  ).remove();
  $("#banners, #footer, #footer-with-get-button").remove();
}

function findContentRoot($: CheerioAPI) {
  const candidates = ["#contents", "#doc-contents"];
  for (const sel of candidates) {
    const el = $(sel).first();
    if (el.length && el.text().replace(/\s+/g, " ").trim()) {
      return el;
    }
  }
  return $("body").first();
}

function cleanDocumentTitle(raw: string): string {
  const t = raw.replace(/\s+/g, " ").trim();
  return t.replace(/\s*-\s*Google Docs\s*$/i, "").trim();
}

function extractTitle($: CheerioAPI, bodyHtml: string): string {
  const headTitle = $("head title").first().text();
  if (headTitle) {
    return cleanDocumentTitle(headTitle);
  }
  const og = $('meta[property="og:title"]').attr("content");
  if (og) {
    return cleanDocumentTitle(og);
  }
  const $body = load(bodyHtml);
  const h1 = $body("h1").first().text();
  if (h1.trim()) {
    return h1.replace(/\s+/g, " ").trim();
  }
  return "Untitled document";
}

function aggregateInlineStyles($: CheerioAPI, $block: Cheerio<Element>): string {
  const parts: string[] = [];
  const own = $block.attr("style");
  if (own) parts.push(own);
  $block.children("span").each((_, span) => {
    const st = $(span).attr("style");
    if (st) parts.push(st);
  });
  return parts.join(";");
}

/** Approximate pt from Google inline font-size. */
function maxFontSizePt(style: string): number | null {
  let maxPt = 0;
  const re = /font-size:\s*([\d.]+)\s*(pt|px|em)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(style)) !== null) {
    const n = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    let pt = 0;
    if (unit === "pt") pt = n;
    else if (unit === "px") pt = n * 0.75;
    else if (unit === "em") pt = n * 11;
    if (pt > maxPt) maxPt = pt;
  }
  return maxPt > 0 ? maxPt : null;
}

function isBoldStyle(style: string): boolean {
  return /font-weight:\s*(700|800|900|bold)\b/i.test(style);
}

/** Google often uses styled `<p>` instead of semantic headings. */
function promoteStyledParagraphsToHeadings($: CheerioAPI, scope: Cheerio<Element>) {
  const blockTags = new Set(["p", "div"]);
  scope.find("p, div").each((_, el) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase() ?? "";
    if (!blockTags.has(tag)) return;
    if ($el.parents("li, th, td").length) return;
    if ($el.parents("blockquote").length) return;
    if ($el.find("p, div, ul, ol, h1, h2, h3, h4, h5, h6, blockquote").length) {
      return;
    }

    const text = $el.text().replace(/\u00a0/g, " ").trim();
    if (!text) return;

    const agg = aggregateInlineStyles($, $el);
    const pt = maxFontSizePt(agg);
    const bold = isBoldStyle(agg);

    let level: 2 | 3 | 4 | null = null;
    if (pt != null) {
      if (pt >= 22) level = 2;
      else if (pt >= 17) level = 3;
      else if (pt >= 13.5 && bold) level = 4;
    } else if (bold && text.length <= 140 && $el.children().length <= 4) {
      level = 4;
    }

    if (!level) return;

    const tagName = `h${level}` as const;
    const $h = $(`<${tagName}></${tagName}>`);
    $h.append($el.contents());
    $el.replaceWith($h);
  });
}

/** Google sometimes paints quotes as indented / bordered paragraphs. */
function promoteIndentedParagraphsToBlockquote($: CheerioAPI, scope: Cheerio<Element>) {
  scope.find("p").each((_, el) => {
    const $p = $(el);
    if ($p.parents("blockquote, li").length) return;
    const style = aggregateInlineStyles($, $p);
    const looksQuoted =
      /border-left:\s*[^;]*(solid|rgb|#)/i.test(style) ||
      /padding-left:\s*(3[6-9]|[4-9]\d)pt/i.test(style) ||
      /margin-left:\s*(3[6-9]|[4-9]\d)pt/i.test(style);
    if (!looksQuoted) return;
    const $bq = $("<blockquote></blockquote>");
    $bq.append($p.contents());
    $p.replaceWith($bq);
  });
}

function extractUrlFromCssUrl(value: string): string | null {
  const m = value.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
  if (!m) return null;
  return m[2].trim();
}

/** Inline “images” are often CSS background-image on empty spans. */
function materializeBackgroundImages($: CheerioAPI, scope: Cheerio<Element>) {
  scope.find("[style*='background-image']").each((_, el) => {
    const $el = $(el);
    const style = $el.attr("style") ?? "";
    const url = extractUrlFromCssUrl(style);
    if (!url || !/^https?:\/\//i.test(url)) return;

    const $img = $("<img />");
    $img.attr("src", url);
    $img.attr("alt", $el.attr("aria-label") ?? "");

    const hasImgChild = $el.find("img").length > 0;
    if (hasImgChild) {
      $el.removeAttr("style");
      return;
    }

    const text = $el.text().replace(/\u00a0/g, "").trim();
    const onlyDecorative = $el.children().length === 0 && text === "";
    if (onlyDecorative) {
      $el.replaceWith($img);
      return;
    }

    $el.prepend($img);
    $el.removeAttr("style");
  });
}

function normalizeImageSources($: CheerioAPI, scope: Cheerio<Element>) {
  scope.find("img").each((_, el) => {
    const $img = $(el);
    const src = ($img.attr("src") ?? "").trim();
    const dataSrc = ($img.attr("data-src") ?? "").trim();
    if (!src && dataSrc) {
      $img.attr("src", dataSrc);
    }
    const srcset = $img.attr("srcset");
    if ((!$img.attr("src") || !$img.attr("src")?.trim()) && srcset) {
      const first = srcset.split(",")[0]?.trim().split(/\s+/)[0];
      if (first && /^https?:\/\//i.test(first)) {
        $img.attr("src", first);
      }
    }
  });
}

/**
 * Unwraps Google layout `<div>`s that only wrap block flow (so we do not rely on
 * div spacing in CSS as much).
 */
function unwrapStructuralDivs($: CheerioAPI, scope: Cheerio<Element>) {
  for (let i = 0; i < 64; i++) {
    let unwrapped = 0;
    scope.find("div").each((_, el) => {
      const $div = $(el);
      if ($div.parents("li, td, th").length) return;
      const children = $div.children();
      if (children.length === 0) return;
      const allBlock = children.toArray().every((c) => {
        const name = c.tagName?.toLowerCase() ?? "";
        return (
          /^h[1-6]$/.test(name) ||
          [
            "p",
            "ul",
            "ol",
            "blockquote",
            "pre",
            "hr",
            "div",
            "img",
          ].includes(name)
        );
      });
      if (!allBlock) return;
      $div.replaceWith($div.contents());
      unwrapped++;
    });
    if (!unwrapped) break;
  }
}

/**
 * Converts common Google Docs inline `style` patterns to semantic tags before styles are stripped.
 */
function promoteInlineStyles($: CheerioAPI, scope: Cheerio<Element>) {
  const bold = /font-weight:\s*(700|800|900|bold)\b/i;
  const italic = /font-style:\s*italic\b/i;

  for (let i = 0; i < 48; i++) {
    let changed = false;
    scope.find("[style]").each((_, el) => {
      const $el = $(el);
      const style = $el.attr("style") ?? "";
      const contents = $el.contents();

      if (bold.test(style) && !italic.test(style)) {
        $el.replaceWith($("<strong></strong>").append(contents));
        changed = true;
        return;
      }
      if (italic.test(style) && !bold.test(style)) {
        $el.replaceWith($("<em></em>").append(contents));
        changed = true;
        return;
      }
      if (bold.test(style) && italic.test(style)) {
        $el.replaceWith(
          $("<strong></strong>").append($("<em></em>").append(contents)),
        );
        changed = true;
        return;
      }

      $el.removeAttr("style");
    });
    if (!changed) break;
  }
}

function stripPresentationAttributes($: CheerioAPI, scope: Cheerio<Element>) {
  scope.find("*").each((_, el) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase() ?? "";
    if (tag === "a") {
      $el.removeAttr("class").removeAttr("id").removeAttr("style");
      return;
    }
    if (tag === "img") {
      $el.removeAttr("class").removeAttr("id").removeAttr("style");
      return;
    }
    $el.removeAttr("class").removeAttr("id").removeAttr("style").removeAttr("dir");
  });
}

function unwrapBareSpans($: CheerioAPI, scope: Cheerio<Element>) {
  for (let i = 0; i < 64; i++) {
    const spans = scope.find("span").toArray();
    let unwrapped = 0;
    for (const el of spans) {
      const $el = $(el);
      const attrs = $el.attr();
      if (!attrs || Object.keys(attrs).length === 0) {
        $el.replaceWith($el.contents());
        unwrapped++;
      }
    }
    if (!unwrapped) break;
  }
}

function collapsePlainText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function buildExcerptFromHtml(fragmentHtml: string, maxLen = 280): string {
  const $ = load(`<div id="excerpt-root">${fragmentHtml}</div>`);
  const text = collapsePlainText($("#excerpt-root").text());
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}

function wrapReadingArticle(innerHtml: string): string {
  const trimmed = innerHtml.trim();
  if (!trimmed) return '<article class="prose-article"></article>';
  return `<article class="prose-article">${trimmed}</article>`;
}

/**
 * Parses raw HTML from a **published** Google Doc (`…/document/d/…/pub`) that was already fetched.
 * Prefer {@link parseGoogleDocFromUrl} unless you manage `fetch` yourself.
 */
export function parsePublishedGoogleDocHtml(html: string): ParsedGoogleDoc {
  const $ = load(html);
  stripGoogleChrome($);

  const title = extractTitle($, html);
  const root = findContentRoot($);

  if (!root.length) {
    throw new GoogleDocParseError("Could not locate document body.");
  }

  const $doc = load("<div id=\"gd-root\"></div>");
  const $root = $doc("#gd-root");
  const inner = root.html()?.trim() ?? "";
  if (inner) {
    $root.html(inner);
  } else {
    $root.append(root.clone().contents());
  }

  stripGoogleChrome($doc);
  materializeBackgroundImages($doc, $root);
  normalizeImageSources($doc, $root);
  promoteStyledParagraphsToHeadings($doc, $root);
  promoteIndentedParagraphsToBlockquote($doc, $root);
  promoteInlineStyles($doc, $root);
  unwrapStructuralDivs($doc, $root);
  stripPresentationAttributes($doc, $root);
  unwrapBareSpans($doc, $root);

  const dirty = $root.html() ?? "";
  const sanitized = sanitizeHtml(dirty, SANITIZE_OPTIONS).trim();
  const htmlOut = wrapReadingArticle(sanitized);
  const excerpt = buildExcerptFromHtml(sanitized);

  return {
    title,
    html: htmlOut,
    excerpt,
  };
}

/**
 * Fetches a published Google Doc HTML page and returns a cleaned article payload.
 *
 * The URL must be the **published** link (`File → Share → Publish to web → Publish`
 * then use the “Published content & settings” link), e.g.:
 * `https://docs.google.com/document/d/<documentId>/pub`
 */
export async function parseGoogleDocFromUrl(
  urlString: string,
  init?: RequestInit,
): Promise<ParsedGoogleDoc> {
  const url = assertPublishedGoogleDocUrl(urlString);

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      ...DEFAULT_FETCH_HEADERS,
      ...(init?.headers ?? {}),
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new GoogleDocParseError(
      `Failed to fetch document (HTTP ${response.status} ${response.statusText}).`,
    );
  }

  const html = await response.text();
  return parsePublishedGoogleDocHtml(html);
}

/**
 * Re-apply the same allowlist used during import before rendering stored HTML
 * (defense in depth against tampered database rows).
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS).trim();
}

export class GoogleDocParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GoogleDocParseError";
  }
}
