"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

type ThemeChoice = "light" | "dark" | "system";

const storageKey = "docs-publisher-theme";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function readStoredTheme(): ThemeChoice {
  const stored = localStorage.getItem(storageKey) as ThemeChoice | null;
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function getSnapshot(): string {
  const theme = readStoredTheme();
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  return `${theme}:${prefersDark ? "1" : "0"}`;
}

function getServerSnapshot(): string {
  return "system:0";
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onMq = () => onStoreChange();
  mq.addEventListener("change", onMq);
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey || e.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    mq.removeEventListener("change", onMq);
    window.removeEventListener("storage", onStorage);
  };
}

function setStoredTheme(theme: ThemeChoice) {
  localStorage.setItem(storageKey, theme);
  emit();
}

function parseSnapshot(s: string): { theme: ThemeChoice; prefersDark: boolean } {
  const colon = s.lastIndexOf(":");
  const t = (colon === -1 ? s : s.slice(0, colon)) as ThemeChoice;
  const p = colon === -1 ? "0" : s.slice(colon + 1);
  const theme: ThemeChoice =
    t === "light" || t === "dark" || t === "system" ? t : "system";
  return { theme, prefersDark: p === "1" };
}

export function ThemeToggle() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { theme, prefersDark } = parseSnapshot(snapshot);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const dark =
      theme === "dark" || (theme === "system" && prefersDark);
    root.classList.toggle("dark", dark);
  }, [theme, prefersDark]);

  return (
    <div
      className="ml-1 inline-flex rounded-md border border-border bg-muted-surface p-0.5"
      role="group"
      aria-label="Theme"
    >
      {(
        [
          { value: "light" as const, label: "Light" },
          { value: "dark" as const, label: "Dark" },
          { value: "system" as const, label: "Auto" },
        ] as const
      ).map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setStoredTheme(value)}
          className={
            theme === value
              ? "rounded bg-surface px-2 py-1.5 font-sans text-xs font-medium text-foreground shadow-sm"
              : "rounded px-2 py-1.5 font-sans text-xs font-medium text-muted transition-colors hover:text-foreground"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
