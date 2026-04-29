import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PetForm } from "@/components/pets/pet-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/services/auth";
import type { Pet, Profile } from "@/types";

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: pet } = await supabase.from("pets").select("*").eq("id", id).single<Pet>();
  if (!pet) notFound();

  const { data } =
    profile?.role === "admin"
      ? await supabase.from("profiles").select("*").eq("role", "customer").order("full_name").returns<Profile[]>()
      : { data: [] };
  const owners = data ?? [];

  return (
    <>
      <PageHeader title={`Editar ${pet.name}`} description="Actualiza datos privados y visibilidad del perfil NFC." />
      <Card>
        <CardHeader>
          <CardTitle>Datos de la mascota</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm pet={pet} owners={owners} />
        </CardContent>
      </Card>
    </>
  );
}
