import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/src/lib/admin/auth";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage posts and content",
};

export default async function AdminPage() {
  // Verify admin authentication
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
