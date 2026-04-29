import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentProfile } from "@/services/auth";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  return (
    <>
      <PageHeader title="Cuenta" description="Datos básicos del propietario." />
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Info label="Nombre" value={profile?.full_name ?? "Sin dato"} />
          <Info label="Correo" value={profile?.email ?? "Sin dato"} />
          <Info label="Teléfono" value={profile?.phone ?? "Sin dato"} />
          <Info label="Rol" value={profile?.role ?? "customer"} />
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
