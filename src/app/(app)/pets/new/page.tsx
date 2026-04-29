import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PetForm } from "@/components/pets/pet-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/services/auth";
import type { Profile } from "@/types";

export default async function NewPetPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data } =
    profile?.role === "admin"
      ? await supabase.from("profiles").select("*").eq("role", "customer").order("full_name").returns<Profile[]>()
      : { data: [] };
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
