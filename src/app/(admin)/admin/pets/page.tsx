import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Pet } from "@/types";

export default async function AdminPetsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("pets").select("*").order("created_at", { ascending: false }).returns<Pet[]>();
  const pets = data ?? [];

  return (
    <>
      <PageHeader title="Mascotas admin" description="Vista global para editar mascotas y copiar URLs NFC." action={<Button asChild><Link href="/pets/new">Nueva mascota</Link></Button>} />
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mascota</TableHead>
              <TableHead>Token público</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pets.map((pet) => (
              <TableRow key={pet.id}>
                <TableCell>
                  <p className="font-medium">{pet.name}</p>
                  <p className="text-sm text-muted-foreground">{pet.species}</p>
                </TableCell>
                <TableCell className="break-all">{pet.public_token}</TableCell>
                <TableCell><Badge>{pet.nfc_enabled ? "NFC activo" : "NFC inactivo"}</Badge></TableCell>
                <TableCell><Button asChild variant="outline" size="sm"><Link href={`/pets/${pet.id}`}>Abrir</Link></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
