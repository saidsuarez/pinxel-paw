import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireUser } from "@/services/auth";
import type { Pet, VeterinaryRecord } from "@/types";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const petsQuery = supabase.from("pets").select("*").order("created_at", { ascending: false });
  const { data: petsData } =
    profile?.role === "admin" ? await petsQuery.returns<Pet[]>() : await petsQuery.eq("owner_id", user.id).returns<Pet[]>();
  const pets = petsData ?? [];

  const { data: recordsData } = await supabase
    .from("veterinary_records")
    .select("*")
    .order("date", { ascending: false })
    .limit(5)
    .returns<VeterinaryRecord[]>();
  const records = recordsData ?? [];

  return (
    <>
      <PageHeader
        title={`Hola, ${profile?.full_name ?? "bienvenido"}`}
        description="Resumen rápido de mascotas, perfiles NFC y actividad médica."
        action={
          <Button asChild>
            <Link href="/pets/new">
              <Plus size={16} />
              Nueva mascota
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Mascotas" value={pets.length} />
        <Stat title="NFC activos" value={pets.filter((pet) => pet.nfc_enabled).length} />
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
            {pets.length === 0 ? <p className="text-sm text-muted-foreground">Todavía no hay mascotas registradas.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimos registros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="rounded-md border p-3">
                <p className="font-medium">{record.title}</p>
                <p className="text-sm text-muted-foreground">{record.record_type} · {record.date}</p>
              </div>
            ))}
            {records.length === 0 ? <p className="text-sm text-muted-foreground">Sin registros médicos por ahora.</p> : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
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
