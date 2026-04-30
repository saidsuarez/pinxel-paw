import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PetForm } from "@/components/pets/pet-form";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/services/auth";
import type { Profile } from "@/types";

export default async function NewPetPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("role", "customer").order("full_name").returns<Profile[]>();
  const owners = data ?? [];

  return (
    <>
      <PageHeader title="Nueva mascota" description="Crea el perfil privado y genera su token público NFC." />
      <Card>
        <CardHeader>
          <CardTitle>Datos de la mascota</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm owners={owners} />
        </CardContent>
      </Card>
    </>
  );
}
