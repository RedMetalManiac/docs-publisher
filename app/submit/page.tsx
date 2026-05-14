import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit/submit-form";
import { ReadingContainer } from "@/components/typography/reading-container";

export const metadata: Metadata = {
  title: "Submit",
  description: "Send us your draft, outline, or pitch.",
};

export default function SubmitPage() {
  return (
    <div className="flex flex-1 flex-col py-14 sm:py-16 lg:py-20">
      <ReadingContainer>
        <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-muted">
          For writers
        </p>
        <h1
          id="submit-heading"
          className="mt-4 font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl"
        >
          Submit a story
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-muted sm:text-lg">
          Share a working title, your email, and either a short pitch or a full
          draft. We read everything—no accounts required yet.
        </p>
        <div className="mt-12 max-w-xl">
          <SubmitForm />
        </div>
      </ReadingContainer>
    </div>
  );
}
