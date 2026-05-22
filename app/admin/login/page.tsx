import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./login-form";
import { ReadingContainer } from "@/components/typography/reading-container";
import { verifyAdminSession } from "@/src/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Admin dashboard login",
};

export default async function AdminLoginPage() {
  // If already authenticated, redirect to admin dashboard
  const isAuthenticated = await verifyAdminSession();
  if (isAuthenticated) {
    redirect("/admin");
  }

  return (
    <div className="flex flex-1 flex-col py-14 sm:py-16 lg:py-20">
      <ReadingContainer>
        <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Admin
        </p>
        <h1
          id="admin-login-heading"
          className="mt-4 font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl"
        >
          Sign in
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-muted sm:text-lg">
          Enter your admin password to access the dashboard.
        </p>
        <div className="mt-12 max-w-xl">
          <AdminLoginForm />
        </div>
      </ReadingContainer>
    </div>
  );
}
