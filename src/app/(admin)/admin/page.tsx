import Link from "next/link";
import type { ComponentType } from "react";
import { Activity, ClipboardList, PawPrint, TrendingUp, Users } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Pet, Profile, VeterinaryRecord } from "@/types";

type AdminRecord = Pick<VeterinaryRecord, "id" | "pet_id" | "record_type" | "title" | "date" | "created_at"> & {
  pets: Pick<Pet, "id" | "name" | "owner_id"> | null;
};

type RecordTypeCount = {
  type: string;
  count: number;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ count: users = 0 }, { count: pets = 0 }, { count: records = 0 }, { data: recordTypesData }, { data: recentRecordsData }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("pets").select("*", { count: "exact", head: true }),
    supabase.from("veterinary_records").select("*", { count: "exact", head: true }),
    supabase.from("veterinary_records").select("id, pet_id, record_type, date, created_at").returns<Pick<VeterinaryRecord, "id" | "pet_id" | "record_type" | "date" | "created_at">[]>(),
    supabase
      .from("veterinary_records")
      .select("id, pet_id, record_type, title, date, created_at, pets(id, name, owner_id)")
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<AdminRecord[]>()
  ]);
  const recentRecords = recentRecordsData ?? [];
  const ownerIds = [...new Set(recentRecords.map((record) => record.pets?.owner_id).filter(Boolean))] as string[];
  const { data: ownersData } = ownerIds.length > 0
    ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ownerIds).returns<Pick<Profile, "user_id" | "full_name" | "email">[]>()
    : { data: [] };
  const ownersById = new Map((ownersData ?? []).map((owner) => [owner.user_id, owner]));

  const recordTypes = countRecordTypes(recordTypesData ?? []);
  const topType = recordTypes[0];
  const now = Date.now();
  const last30Days = (recordTypesData ?? []).filter((record) => {
    const timestamp = new Date(record.created_at).getTime();
    return Number.isFinite(timestamp) && now - timestamp <= 30 * 24 * 60 * 60 * 1000;
  }).length;
  const petsWithRecords = new Set((recordTypesData ?? []).map((record) => record.pet_id)).size;
  const averageRecordsPerPet = pets ? Math.round(((records ?? 0) / Math.max(pets, 1)) * 10) / 10 : 0;

  return (
    <>
      <PageHeader title="Panel admin" description="Operación manual y analítica de actividad de la plataforma." />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Usuarios" value={users ?? 0} href="/admin/users" icon={Users} />
        <Stat title="Mascotas" value={pets ?? 0} href="/admin/pets" icon={PawPrint} />
        <Stat title="Registros gestionados" value={records ?? 0} icon={ClipboardList} description="Actividad total creada por clientes." />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Stat title="Últimos 30 días" value={last30Days} icon={Activity} description="Registros creados recientemente." />
        <Stat title="Mascotas con registros" value={petsWithRecords} icon={PawPrint} description="Mascotas con actividad médica." />
        <Stat title="Promedio por mascota" value={averageRecordsPerPet} icon={TrendingUp} description="Registros promedio en la plataforma." />
        <Stat title="Tipo principal" value={topType?.count ?? 0} icon={ClipboardList} description={topType ? recordTypeLabel(topType.type) : "Sin registros todavía."} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Registros por tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recordTypes.map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={recordBadgeVariant(item.type)}>{recordTypeLabel(item.type)}</Badge>
                </div>
                <p className="text-lg font-semibold">{item.count}</p>
              </div>
            ))}
            {recordTypes.length === 0 ? <p className="text-sm text-muted-foreground">No hay registros para analizar todavía.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos registros de usuarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRecords.map((record) => {
              const owner = record.pets?.owner_id ? ownersById.get(record.pets.owner_id) : null;

              return (
                <div key={record.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Badge variant={recordBadgeVariant(record.record_type)}>{recordTypeLabel(record.record_type)}</Badge>
                      <p className="mt-2 font-semibold">{record.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.pets?.name ?? "Mascota sin dato"} · {owner?.full_name ?? owner?.email ?? "Usuario sin dato"}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                  </div>
                </div>
              );
            })}
            {recentRecords.length === 0 ? <p className="text-sm text-muted-foreground">No hay actividad reciente.</p> : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function countRecordTypes(records: Pick<VeterinaryRecord, "record_type">[]): RecordTypeCount[] {
  const counts = records.reduce<Map<string, number>>((acc, record) => {
    acc.set(record.record_type, (acc.get(record.record_type) ?? 0) + 1);
    return acc;
  }, new Map());

  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

function recordTypeLabel(recordType: string) {
  const labels: Record<string, string> = {
    vacuna: "Vacunas",
    alergia: "Alergias",
    consulta: "Consultas",
    medicamento: "Medicamentos",
    nota: "Notas médicas"
  };

  return labels[recordType] ?? recordType;
}

function recordBadgeVariant(recordType: string): BadgeVariant {
  if (recordType === "vacuna") return "success";
  if (recordType === "alergia") return "warning";
  return "info";
}

function Stat({
  title,
  value,
  href,
  icon: Icon,
  description
}: {
  title: string;
  value: number;
  href?: string;
  icon: ComponentType<{ size?: number }>;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        {href ? (
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={href}>
              <Icon size={16} />
              Gestionar
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
