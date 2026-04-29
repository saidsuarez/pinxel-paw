import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { RecordForm } from "@/components/records/record-form";
import { createClient } from "@/lib/supabase/server";
import type { Pet } from "@/types";

export default async function NewRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pet } = await supabase.from("pets").select("*").eq("id", id).single<Pet>();
  if (!pet) notFound();

  return (
    <>
      <PageHeader title={`Nuevo registro para ${pet.name}`} description="Crea vacunas, alergias, consultas, medicamentos o notas médicas." />
      <Card>
        <CardHeader>
          <CardTitle>Registro veterinario</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordForm petId={id} />
        </CardContent>
      </Card>
    </>
  );
}
