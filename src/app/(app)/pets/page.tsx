import Link from "next/link";
import { ExternalLink, Eye, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireUser } from "@/services/auth";
import type { Pet } from "@/types";

export default async function PetsPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const query = supabase.from("pets").select("*").order("created_at", { ascending: false });
  const { data } = profile?.role === "admin" ? await query.returns<Pet[]>() : await query.eq("owner_id", user.id).returns<Pet[]>();
  const pets = data ?? [];

  return (
    <>
      <PageHeader
        title="Mascotas"
        description={
          profile?.role === "admin"
            ? "Crea perfiles, asigna propietarios y administra URLs de perfil público."
            : "Edita los perfiles asociados a tus registros veterinarios Pinxel."
        }
        action={
          profile?.role === "admin" ? (
            <Button asChild>
              <Link href="/pets/new">
                <Plus size={16} />
                Nueva mascota
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Público</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pets.map((pet) => (
              <TableRow key={pet.id}>
                <TableCell>
                  <Link href={`/pets/${pet.id}`} className="font-medium hover:text-primary">
                    {pet.name}
                  </Link>
                </TableCell>
                <TableCell>{pet.species}</TableCell>
                <TableCell><Badge variant={pet.nfc_enabled ? "success" : "neutral"}>{pet.nfc_enabled ? "Activo" : "Inactivo"}</Badge></TableCell>
                <TableCell><Badge variant={pet.is_public_enabled ? "info" : "neutral"}>{pet.is_public_enabled ? "Visible" : "Privado"}</Badge></TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
