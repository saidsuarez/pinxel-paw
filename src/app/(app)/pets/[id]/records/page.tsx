import Link from "next/link";
import { Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Pet, VeterinaryRecord } from "@/types";

export default async function RecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pet } = await supabase.from("pets").select("*").eq("id", id).single<Pet>();
  if (!pet) notFound();

  const { data } = await supabase
    .from("veterinary_records")
    .select("*")
    .eq("pet_id", id)
    .order("date", { ascending: false })
    .returns<VeterinaryRecord[]>();
  const records = data ?? [];

  return (
    <>
      <PageHeader
        title={`Registros de ${pet.name}`}
        description="Historial privado. El perfil público solo muestra resúmenes permitidos."
        action={<Button asChild><Link href={`/pets/${id}/records/new`}><Plus size={16} />Nuevo registro</Link></Button>}
      />
      <div className="space-y-3">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge>{record.record_type}</Badge>
                  <h2 className="mt-2 text-lg font-semibold">{record.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{record.description ?? "Sin descripción"}</p>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {records.length === 0 ? <p className="text-sm text-muted-foreground">No hay registros creados.</p> : null}
      </div>
    </>
  );
}
