import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminUserEditForm } from "@/components/auth/admin-user-edit-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export default async function EditAdminUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle<Profile>();

  if (!profile) notFound();

  return (
    <>
      <PageHeader
        title="Editar usuario"
        description={profile.email}
        action={
          <Button asChild variant="outline">
            <Link href="/admin/users"><ArrowLeft size={16} />Volver</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Acceso y perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUserEditForm profile={profile} />
        </CardContent>
      </Card>
    </>
  );
}
