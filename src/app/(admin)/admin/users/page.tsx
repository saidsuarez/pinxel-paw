import Link from "next/link";
import { Mail, PawPrint, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).returns<Profile[]>();
  const users = data ?? [];
  const userIds = users.map((user) => user.user_id);
  const { data: petsData } = userIds.length > 0
    ? await supabase.from("pets").select("owner_id").in("owner_id", userIds).returns<Array<{ owner_id: string }>>()
    : { data: [] };
  const petCountsByOwner = (petsData ?? []).reduce<Map<string, number>>((counts, pet) => {
    counts.set(pet.owner_id, (counts.get(pet.owner_id) ?? 0) + 1);
    return counts;
  }, new Map());

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Clientes, roles y mascotas asociadas."
        action={<Button asChild><Link href="/admin/users/new"><Plus size={16} />Agregar usuario</Link></Button>}
      />
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Mascotas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const petCount = petCountsByOwner.get(user.user_id) ?? 0;

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name ?? "Sin nombre"}</TableCell>
                  <TableCell className="break-all">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "info" : "neutral"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={petCount > 0 ? "info" : "neutral"}>{petCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="icon" aria-label={`Enviar correo a ${user.email}`}>
                        <a href={`mailto:${user.email}`}><Mail size={16} /></a>
                      </Button>
                      <Button asChild variant="outline" size="icon" aria-label={`Editar ${user.full_name ?? user.email}`}>
                        <Link href={`/admin/users/${user.user_id}/edit`}><Pencil size={16} /></Link>
                      </Button>
                      <Button asChild variant="outline" size="icon" aria-label={`Ver mascotas de ${user.full_name ?? user.email}`}>
                        <Link href={`/admin/pets?owner=${user.user_id}`}><PawPrint size={16} /></Link>
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
