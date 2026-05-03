import Link from "next/link";
import { ClipboardList, ShieldCheck } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { getCurrentProfile, requireUser } from "@/services/auth";
import type { Pet, VeterinaryRecord } from "@/types";

type RecordWithPet = VeterinaryRecord & {
  pets: Pick<Pet, "id" | "name"> | null;
};

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  if (profile?.role === "admin") return <AdminDashboard />;

  const supabase = await createClient();
  const petsQuery = supabase.from("pets").select("*").order("created_at", { ascending: false });
  const { data: petsData } = await petsQuery.eq("owner_id", user.id).returns<Pet[]>();
  const pets = petsData ?? [];

  const petIds = pets.map((pet) => pet.id);
  const recordsQuery = supabase
    .from("veterinary_records")
    .select("*, pets(id, name)")
    .order("date", { ascending: false })
    .limit(6);
  const { data: recordsData } = petIds.length === 0
    ? { data: [] }
    : await recordsQuery.in("pet_id", petIds).returns<RecordWithPet[]>();
  const records = recordsData ?? [];

  return (
    <>
      <PageHeader
        title={`Hola, ${profile?.full_name ?? "bienvenido"}`}
        description="Administra tus mascotas y revisa rápidamente los registros veterinarios que has agregado."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Mascotas" value={pets.length} />
        <Stat title="Perfiles activos" value={pets.filter((pet) => pet.nfc_enabled).length} />
        <Stat title="Públicos" value={pets.filter((pet) => pet.is_public_enabled).length} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Mascotas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pets.slice(0, 6).map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted">
                <div>
                  <p className="font-medium">{pet.name}</p>
                  <p className="text-sm text-muted-foreground">{pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</p>
                </div>
                {pet.is_public_enabled ? <ShieldCheck className="text-primary" size={18} /> : null}
              </Link>
            ))}
            {pets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no tienes mascotas asociadas. Pinxel las cargará según tus registros comprados.
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimos registros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {records.map((record) => (
              <Link key={record.id} href={`/records?pet=${record.pet_id}`} className="block rounded-md border p-3 hover:bg-muted">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant={recordBadgeVariant(record.record_type)}>{record.record_type}</Badge>
                    <p className="mt-2 font-medium">{record.title}</p>
                    <p className="text-sm text-muted-foreground">{record.pets?.name ?? "Mascota"} · {formatDate(record.date)}</p>
                  </div>
                  <ClipboardList className="mt-1 shrink-0 text-primary" size={18} />
                </div>
              </Link>
            ))}
            {records.length === 0 ? <p className="text-sm text-muted-foreground">Sin registros médicos por ahora.</p> : null}
            {records.length > 0 ? (
              <Link href="/records" className="inline-flex text-sm font-medium text-primary hover:underline">
                Ver todos los registros
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function recordBadgeVariant(recordType: string): BadgeVariant {
  if (recordType === "vacuna") return "success";
  if (recordType === "alergia") return "warning";
  return "info";
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-semibold">{value}</CardContent>
    </Card>
  );
}
