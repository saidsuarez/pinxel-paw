import Link from "next/link";
import { ClipboardList, PawPrint, Plus } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PetRecordSelector } from "@/components/records/pet-record-selector";
import { RecordForm } from "@/components/records/record-form";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { getCurrentProfile, requireUser } from "@/services/auth";
import type { Pet, VeterinaryRecord } from "@/types";

export default async function RecordsPanelPage({ searchParams }: { searchParams?: Promise<{ pet?: string }> }) {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const params = searchParams ? await searchParams : {};
  const supabase = await createClient();
  const petsQuery = supabase.from("pets").select("*").order("created_at", { ascending: false });
  const { data: petsData } = profile?.role === "admin"
    ? await petsQuery.returns<Pet[]>()
    : await petsQuery.eq("owner_id", user.id).returns<Pet[]>();
  const pets = petsData ?? [];
  const selectedPet = pets.find((pet) => pet.id === params.pet) ?? pets[0];

  const { data: recordsData } = selectedPet
    ? await supabase
      .from("veterinary_records")
      .select("*")
      .eq("pet_id", selectedPet.id)
      .order("date", { ascending: false })
      .returns<VeterinaryRecord[]>()
    : { data: [] };
  const records = recordsData ?? [];

  return (
    <>
      <PageHeader
        title="Registros"
        description="Gestiona el historial veterinario por mascota desde un solo panel."
      />

      {pets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
            <PawPrint size={32} />
            <p>No tienes mascotas asociadas todavía.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-4">
            <PetRecordSelector pets={pets.map((pet) => ({ id: pet.id, name: pet.name }))} selectedPetId={selectedPet.id} />
            <div className="hidden gap-2 overflow-x-auto sm:flex">
              {pets.map((pet) => (
                <Button key={pet.id} asChild variant={pet.id === selectedPet.id ? "default" : "outline"} size="sm" className="shrink-0">
                  <Link href={`/records?pet=${pet.id}`}>
                    <PawPrint size={16} />
                    {pet.name}
                  </Link>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList size={19} />
                  Historial de {selectedPet.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Badge variant={recordBadgeVariant(record.record_type)}>{record.record_type}</Badge>
                        <h2 className="mt-2 text-lg font-semibold">{record.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{record.description ?? "Sin descripción"}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                    </div>
                    {record.next_due_date ? (
                      <p className="mt-3 text-sm text-muted-foreground">Próxima fecha: {formatDate(record.next_due_date)}</p>
                    ) : null}
                  </div>
                ))}
                {records.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No hay registros creados para {selectedPet.name}.</p>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={19} />
                  Nuevo registro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecordForm petId={selectedPet.id} redirectTo={`/records?pet=${selectedPet.id}`} />
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </>
  );
}

function recordBadgeVariant(recordType: string): BadgeVariant {
  if (recordType === "vacuna") return "success";
  if (recordType === "alergia") return "warning";
  return "info";
}
