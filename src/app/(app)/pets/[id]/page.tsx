import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PublicSettingsForm } from "@/components/pets/public-settings-form";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Pet, PublicProfileSettings, VeterinaryRecord } from "@/types";

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: pet } = await supabase.from("pets").select("*").eq("id", id).single<Pet>();
  if (!pet) notFound();

  const [{ data: recordsData }, { data: settings = null }] = await Promise.all([
    supabase.from("veterinary_records").select("*").eq("pet_id", id).order("date", { ascending: false }).returns<VeterinaryRecord[]>(),
    supabase.from("public_profile_settings").select("*").eq("pet_id", id).maybeSingle<PublicProfileSettings>()
  ]);
  const records = recordsData ?? [];
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/p/${pet.public_token}`;

  return (
    <>
      <PageHeader
        title={pet.name}
        description={`${pet.species}${pet.breed ? ` · ${pet.breed}` : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href={`/p/${pet.public_token}`}><ExternalLink size={16} />Ver NFC</Link></Button>
            <Button asChild variant="outline"><Link href={`/pets/${pet.id}/edit`}><Pencil size={16} />Editar</Link></Button>
            <Button asChild><Link href={`/pets/${pet.id}/records/new`}><Plus size={16} />Registro</Link></Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Nacimiento" value={formatDate(pet.birth_date)} />
            <Info label="Sexo" value={pet.sex ?? "Sin dato"} />
            <Info label="Color" value={pet.color ?? "Sin dato"} />
            <Info label="Peso" value={pet.weight ? `${pet.weight} kg` : "Sin dato"} />
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">URL pública NFC</p>
              <p className="break-all font-medium">{publicUrl}</p>
            </div>
            <Badge>{pet.is_public_enabled ? "Perfil público activo" : "Perfil público desactivado"}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Privacidad pública</CardTitle>
          </CardHeader>
          <CardContent>
            <PublicSettingsForm petId={pet.id} settings={settings} />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Registros recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {records.slice(0, 6).map((record) => (
            <Link key={record.id} href={`/pets/${pet.id}/records`} className="block rounded-md border p-3 hover:bg-muted">
              <p className="font-medium">{record.title}</p>
              <p className="text-sm text-muted-foreground">{record.record_type} · {formatDate(record.date)}</p>
            </Link>
          ))}
          {records.length === 0 ? <p className="text-sm text-muted-foreground">Sin registros médicos.</p> : null}
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
