"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import {
  GoogleDocParseError,
  parseGoogleDocFromUrl,
} from "@/src/lib/parser/google-docs-parser";
import { allocateUniqueSlug } from "@/src/lib/posts/slug";
import { estimateReadMinutesFromHtml } from "@/src/lib/posts/read-time";
import { associateTagsWithPost } from "@/src/lib/tags/actions";
import type { SubmitGoogleDocState } from "./submit-state";

export type { SubmitGoogleDocState } from "./submit-state";

export async function submitGoogleDocPost(
  _prevState: SubmitGoogleDocState,
  formData: FormData,
): Promise<SubmitGoogleDocState> {
  const sourceUrl = (formData.get("source_url") ?? "").toString().trim();
  const authorRaw = (formData.get("author") ?? "").toString().trim();
  const author = authorRaw || "Contributor";
  const tagsRaw = (formData.get("tags") ?? "").toString().trim();

  if (!sourceUrl) {
    return { error: "Paste the published Google Doc URL." };
  }

  let parsed: Awaited<ReturnType<typeof parseGoogleDocFromUrl>>;
  try {
    parsed = await parseGoogleDocFromUrl(sourceUrl);
  } catch (e) {
    if (e instanceof GoogleDocParseError) {
      return { error: e.message };
    }
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: "Could not import that document." };
  }

  const supabase = await createClient();
  let slug: string;
  try {
    slug = await allocateUniqueSlug(supabase, parsed.title);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Slug conflict.";
    return { error: msg };
  }

  const read_time_minutes = estimateReadMinutesFromHtml(parsed.html);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content_html: parsed.html,
      author,
      source_url: sourceUrl,
      read_time_minutes,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Associate tags with the post
  if (tagsRaw) {
    const tagNames = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tagNames.length > 0) {
      const tagResult = await associateTagsWithPost(post.id, tagNames);
      if (tagResult.error) {
        return { error: tagResult.error };
      }
    }
  }

  redirect(`/article/${slug}`);
}
