"use client";

import { useActionState } from "react";
import { submitGoogleDocPost } from "@/app/submit/actions";
import { submitGoogleDocInitialState } from "@/app/submit/submit-state";

export function SubmitForm() {
  const [state, formAction, pending] = useActionState(
    submitGoogleDocPost,
    submitGoogleDocInitialState,
  );

  return (
    <form action={formAction} className="space-y-8" aria-labelledby="submit-heading">
      {state.error ? (
        <div
          className="rounded-md border border-border bg-muted-surface px-4 py-3 font-sans text-sm text-foreground"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="source_url"
          className="block font-sans text-sm font-medium text-foreground"
        >
          Published Google Doc URL
        </label>
        <input
          id="source_url"
          name="source_url"
          type="url"
          required
          autoComplete="off"
          placeholder="https://docs.google.com/document/d/…/pub"
          disabled={pending}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-sans text-base text-foreground placeholder:text-muted/70 outline-none ring-accent/30 transition-shadow focus:ring-2 disabled:opacity-60"
        />
        <p className="font-sans text-xs leading-relaxed text-muted">
          Use <strong className="font-medium text-foreground">File → Share → Publish to web</strong>{" "}
          in Google Docs, then paste the link that ends with{" "}
          <code className="rounded bg-muted-surface px-1 py-0.5 font-mono text-[0.7rem]">/pub</code>
          .
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="author"
          className="block font-sans text-sm font-medium text-foreground"
        >
          Byline <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="author"
          name="author"
          type="text"
          maxLength={120}
          autoComplete="name"
          placeholder="Contributor"
          disabled={pending}
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-sans text-base text-foreground placeholder:text-muted/70 outline-none ring-accent/30 transition-shadow focus:ring-2 disabled:opacity-60"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-xs text-muted">
          We fetch your published HTML, sanitize it, and store it as a public post.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-foreground px-8 font-sans text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Publishing…" : "Publish from Google Doc"}
        </button>
      </div>
    </form>
  );
}
