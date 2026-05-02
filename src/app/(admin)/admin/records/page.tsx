import Link from "next/link";
import { ClipboardList, PawPrint } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { VeterinaryRecord } from "@/types";

export default async function AdminRecordsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veterinary_records")
    .select("*")
    .order("date", { ascending: false })
    .returns<VeterinaryRecord[]>();
  const records = data ?? [];

  return (
    <>
      <PageHeader title="Registros admin" description="Listado global de registros veterinarios." />
      <div className="space-y-3">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge variant={recordBadgeVariant(record.record_type)}>{record.record_type}</Badge>
                <h2 className="mt-2 font-semibold">{record.title}</h2>
                <p className="text-sm text-muted-foreground">{record.description ?? "Sin descripción"}</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/pets/${record.pet_id}`}><PawPrint size={16} />Mascota</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/pets/${record.pet_id}/records`}><ClipboardList size={16} />Historial</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {records.length === 0 ? <p className="text-sm text-muted-foreground">No hay registros creados.</p> : null}
      </div>
    </>
  );
}

function recordBadgeVariant(recordType: string): BadgeVariant {
  if (recordType === "vacuna") return "success";
  if (recordType === "alergia") return "warning";
  return "info";
}
