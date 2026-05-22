"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "../actions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState<AdminLoginState, FormData>(
    adminLogin,
    {},
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="password"
          className="block font-sans text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="mt-2 block w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Enter password"
        />
      </div>
      {state.error && (
        <p className="font-sans text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-7 font-sans text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Sign in
      </button>
    </form>
  );
}
