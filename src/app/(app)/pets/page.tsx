import Link from "next/link";
import { Plus } from "lucide-react";
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
        description="Administra perfiles, NFC y privacidad pública."
        action={
          <Button asChild>
            <Link href="/pets/new">
              <Plus size={16} />
              Nueva mascota
            </Link>
          </Button>
        }
      />
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>NFC</TableHead>
              <TableHead>Público</TableHead>
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
                <TableCell><Badge>{pet.nfc_enabled ? "Activo" : "Inactivo"}</Badge></TableCell>
                <TableCell><Badge>{pet.is_public_enabled ? "Visible" : "Privado"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
