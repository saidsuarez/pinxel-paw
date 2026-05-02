import Image from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { AlertTriangle, HeartPulse, PawPrint, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPetProfileTheme } from "@/lib/pet-profile-themes";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type PublicPetProfile = {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    sex: string | null;
    birth_date: string | null;
    color: string | null;
    weight: number | null;
    photo_url: string | null;
    profile_theme: string | null;
    public_token: string;
  };
  owner: {
    full_name: string | null;
    phone: string | null;
  } | null;
  settings: {
    show_pet_photo: boolean;
    show_owner_name: boolean;
    show_owner_phone: boolean;
    show_emergency_contact: boolean;
    show_vaccination_status: boolean;
    show_allergies: boolean;
    show_medical_notes: boolean;
  };
  records: Array<{
    id: string;
    record_type: "vacuna" | "alergia" | string;
    title: string;
    date: string;
    next_due_date: string | null;
  }>;
};

export default async function PublicPetPage({ params }: { params: Promise<{ publicToken: string }> }) {
  const { publicToken } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_pet_profile", { token: publicToken });
  const profile = data as PublicPetProfile | null;
  if (!profile) notFound();

  const { pet, owner, settings } = profile;
  const records = profile.records ?? [];
  const allergies = records.filter((record) => record.record_type === "alergia");
  const vaccinations = records.filter((record) => record.record_type === "vacuna");
  const theme = getPetProfileTheme(pet.profile_theme);
  const themeStyle = {
    "--profile-bg": theme.background,
    "--profile-surface": theme.surface,
    "--profile-surface-muted": theme.surfaceMuted,
    "--profile-primary": theme.primary,
    "--profile-primary-text": theme.primaryText,
    "--profile-text": theme.text,
    "--profile-muted": theme.mutedText,
    "--profile-border": theme.border,
    "--profile-badge-bg": theme.badgeBackground,
    "--profile-badge-text": theme.badgeText
  } as CSSProperties;

  return (
    <main className="min-h-screen bg-[var(--profile-bg)] px-4 py-8 text-[var(--profile-text)]" style={themeStyle}>
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-lg border border-[var(--profile-border)] bg-[var(--profile-surface)] shadow-sm">
          <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative aspect-square bg-[var(--profile-surface-muted)]">
              {settings.show_pet_photo !== false && pet.photo_url ? (
                <Image src={pet.photo_url} alt={pet.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--profile-primary)]">
                  <PawPrint size={72} />
                </div>
              )}
            </div>
            <div className="p-6">
              <Badge className="bg-[var(--profile-badge-bg)] text-[var(--profile-badge-text)]">Perfil público verificado</Badge>
              <h1 className="mt-4 text-3xl font-semibold text-[var(--profile-text)]">{pet.name}</h1>
              <p className="mt-2 text-[var(--profile-muted)]">{pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Color" value={pet.color ?? "Sin dato"} />
                <Info label="Nacimiento" value={formatDate(pet.birth_date)} />
                <Info label="Sexo" value={pet.sex ?? "Sin dato"} />
                <Info label="Peso" value={pet.weight ? `${pet.weight} kg` : "Sin dato"} />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {settings.show_owner_phone && owner?.phone ? (
            <Card className="border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-text)]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-[var(--profile-text)] [&_svg]:text-[var(--profile-primary)]"><Phone size={18} />Contacto</CardTitle></CardHeader>
              <CardContent>
                {settings.show_owner_name ? <p className="font-medium">{owner.full_name}</p> : null}
                <a className="text-[var(--profile-primary)] hover:underline" href={`tel:${owner.phone}`}>{owner.phone}</a>
              </CardContent>
            </Card>
          ) : null}
          {settings.show_allergies !== false ? (
            <Card className="border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-text)]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-[var(--profile-text)] [&_svg]:text-[var(--profile-primary)]"><AlertTriangle size={18} />Alergias importantes</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--profile-muted)]">
                {allergies.map((record) => <p key={record.id}>{record.title}</p>)}
                {allergies.length === 0 ? <p>No hay alergias públicas registradas.</p> : null}
              </CardContent>
            </Card>
          ) : null}
          {settings.show_vaccination_status !== false ? (
            <Card className="border-[var(--profile-border)] bg-[var(--profile-surface)] text-[var(--profile-text)] md:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2 text-[var(--profile-text)] [&_svg]:text-[var(--profile-primary)]"><ShieldCheck size={18} />Vacunación</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {vaccinations.map((record) => (
                  <div key={record.id} className="rounded-md border border-[var(--profile-border)] bg-[var(--profile-surface-muted)] p-3">
                    <p className="font-medium">{record.title}</p>
                    <p className="text-sm text-[var(--profile-muted)]">{formatDate(record.date)}</p>
                  </div>
                ))}
                {vaccinations.length === 0 ? <p className="text-sm text-[var(--profile-muted)]">Sin vacunas públicas registradas.</p> : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-[var(--profile-muted)]">
          <HeartPulse size={16} className="text-[var(--profile-primary)]" />
          Información pública limitada por privacidad.
        </p>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[var(--profile-muted)]">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
