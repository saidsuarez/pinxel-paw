import Link from "next/link";
import { ExternalLink, Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Pet, Profile } from "@/types";

export default async function AdminPetsPage({ searchParams }: { searchParams?: Promise<{ owner?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const ownerId = params.owner;
  const supabase = await createClient();
  let query = supabase.from("pets").select("*").order("created_at", { ascending: false });
  if (ownerId) query = query.eq("owner_id", ownerId);

  const [{ data }, { data: owner }] = await Promise.all([
    query.returns<Pet[]>(),
    ownerId
      ? supabase.from("profiles").select("*").eq("user_id", ownerId).maybeSingle<Profile>()
      : Promise.resolve({ data: null })
  ]);
  const pets = data ?? [];
  const ownerIds = [...new Set(pets.map((pet) => pet.owner_id))];
  const { data: ownersData } = ownerIds.length > 0
    ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ownerIds).returns<Pick<Profile, "user_id" | "full_name" | "email">[]>()
    : { data: [] };
  const ownersById = new Map((ownersData ?? []).map((petOwner) => [petOwner.user_id, petOwner]));
  const ownerLabel = owner ? owner.full_name ?? owner.email : null;

  return (
    <>
      <PageHeader
        title={ownerLabel ? `Mascotas de ${ownerLabel}` : "Mascotas admin"}
        description={ownerLabel ? "Vista filtrada por cliente." : "Vista global para editar mascotas y acceder a sus perfiles públicos."}
        action={<Button asChild><Link href="/pets/new"><Plus size={16} />Nueva mascota</Link></Button>}
      />
      {ownerLabel ? (
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/pets">Ver todas las mascotas</Link>
          </Button>
        </div>
      ) : null}
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mascota</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Token público</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pets.map((pet) => {
              const petOwner = ownersById.get(pet.owner_id);

              return (
                <TableRow key={pet.id}>
                  <TableCell>
                    <p className="font-medium">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">{pet.species}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{petOwner?.full_name ?? "Sin nombre"}</p>
                    <p className="break-all text-sm text-muted-foreground">{petOwner?.email ?? "Sin correo"}</p>
                  </TableCell>
                  <TableCell className="break-all">{pet.public_token}</TableCell>
                  <TableCell><Badge variant={pet.nfc_enabled ? "success" : "neutral"}>{pet.nfc_enabled ? "Perfil activo" : "Perfil inactivo"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="icon" aria-label={`Ver ${pet.name}`}>
                        <Link href={`/pets/${pet.id}`}><Eye size={16} /></Link>
                      </Button>
                      <Button asChild variant="outline" size="icon" aria-label={`Editar ${pet.name}`}>
                        <Link href={`/pets/${pet.id}/edit`}><Pencil size={16} /></Link>
                      </Button>
                      <Button asChild variant="outline" size="icon" aria-label={`Abrir perfil público de ${pet.name}`}>
                        <Link href={`/p/${pet.public_token}`}><ExternalLink size={16} /></Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
