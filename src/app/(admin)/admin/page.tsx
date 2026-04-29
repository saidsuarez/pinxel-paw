import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ count: users = 0 }, { count: pets = 0 }, { count: records = 0 }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("pets").select("*", { count: "exact", head: true }),
    supabase.from("veterinary_records").select("*", { count: "exact", head: true })
  ]);

  return (
    <>
      <PageHeader title="Panel admin" description="Operación manual para el MVP: clientes, mascotas, registros y URLs NFC." />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Usuarios" value={users ?? 0} href="/admin/users" />
        <Stat title="Mascotas" value={pets ?? 0} href="/admin/pets" />
        <Stat title="Registros" value={records ?? 0} href="/admin/records" />
      </div>
    </>
  );
}

function Stat({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={href}>Gestionar</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
