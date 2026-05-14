"use client";

import { useState } from "react";

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-border bg-muted-surface px-6 py-10 text-center">
        <p className="font-serif text-xl text-foreground">Thank you.</p>
        <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
          This is a demo—nothing was uploaded. When you wire a backend, this
          message becomes a confirmation with next steps.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      aria-labelledby="submit-heading"
    >
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block font-sans text-sm font-medium text-foreground"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          autoComplete="off"
          placeholder="Working title"
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-sans text-base text-foreground placeholder:text-muted/70 outline-none ring-accent/30 transition-shadow focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block font-sans text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-sans text-base text-foreground placeholder:text-muted/70 outline-none ring-accent/30 transition-shadow focus:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="body"
          className="block font-sans text-sm font-medium text-foreground"
        >
          Draft or pitch
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={12}
          placeholder="Paste your draft, outline, or a few paragraphs about the piece."
          className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 font-sans text-base leading-relaxed text-foreground placeholder:text-muted/70 outline-none ring-accent/30 transition-shadow focus:ring-2"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-xs text-muted">
          By submitting, you agree we may contact you about this submission.
        </p>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-foreground px-8 font-sans text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Send submission
        </button>
      </div>
    </form>
  );
}
