import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile, requireUser } from "@/services/auth";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const profile = await getCurrentProfile();
  return <AppShell profile={profile}>{children}</AppShell>;
}
