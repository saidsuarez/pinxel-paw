import Link from "next/link";
import type { ComponentType } from "react";
import { ClipboardList, PawPrint, Users } from "lucide-react";
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
      <PageHeader title="Panel admin" description="Operación manual para el MVP: clientes, mascotas, registros y perfiles públicos." />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Usuarios" value={users ?? 0} href="/admin/users" icon={Users} />
        <Stat title="Mascotas" value={pets ?? 0} href="/admin/pets" icon={PawPrint} />
        <Stat title="Registros gestionados" value={records ?? 0} icon={ClipboardList} description="Actividad total creada por clientes." />
      </div>
    </>
  );
}

function Stat({
  title,
  value,
  href,
  icon: Icon,
  description
}: {
  title: string;
  value: number;
  href?: string;
  icon: ComponentType<{ size?: number }>;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        {href ? (
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={href}>
              <Icon size={16} />
              Gestionar
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
