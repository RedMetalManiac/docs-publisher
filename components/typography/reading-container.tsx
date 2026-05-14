import type { ReactNode } from "react";

type ReadingContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Centered column tuned for long-form reading (approx. 65–75 characters).
 */
export function ReadingContainer({
  children,
  className = "",
}: ReadingContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-reading px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
