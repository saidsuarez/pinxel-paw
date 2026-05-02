import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminUserForm } from "@/components/auth/admin-user-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewAdminUserPage() {
  return (
    <>
      <PageHeader
        title="Agregar usuario"
        description="Crea un cliente con una contraseña temporal y luego asígnale sus mascotas."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/users"><ArrowLeft size={16} />Volver</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminUserForm />
        </CardContent>
      </Card>
    </>
  );
}
