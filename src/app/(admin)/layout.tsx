import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/services/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("admin");
  return <AppShell profile={profile}>{children}</AppShell>;
}
