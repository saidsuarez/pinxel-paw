import Link from "next/link";
import Image from "next/image";
import { HeartPulse, LockKeyhole, QrCode, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: QrCode, title: "Perfil público", text: "Una URL limitada para identificar a la mascota desde link directo, QR o sticker." },
  { icon: HeartPulse, title: "Historial médico", text: "Registros veterinarios organizados para vacunas, consultas, alergias y notas." },
  { icon: LockKeyhole, title: "Privacidad", text: "El cliente decide qué datos se muestran públicamente." }
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b bg-[linear-gradient(120deg,#ffffff_0%,#f7f7fa_62%,#fff7ea_100%)]">
        <div className="mx-auto grid min-h-[78vh] max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-bold text-muted-foreground shadow-sm">
              <Image src="/pinxel-isotipo.svg" alt="" width={18} height={18} />
              paw.pinxel.co
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-normal text-foreground sm:text-6xl">Paw Pinxel</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Registros veterinarios digitales para mascotas, conectados a perfiles públicos y pensados para que cada familia tenga la información importante a mano.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/login">Entrar al panel</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Crear cuenta</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border bg-white p-4 shadow-sm">
            <div className="aspect-[4/3] rounded-2xl bg-[radial-gradient(circle_at_28%_24%,#F59B1B_0_13%,transparent_14%),radial-gradient(circle_at_70%_38%,#4EBBB8_0_16%,transparent_17%),linear-gradient(135deg,#ffffff,#f7f7fa)] p-6">
              <div className="flex h-full flex-col justify-end">
                <div className="rounded-2xl border bg-white/90 p-6 shadow-sm backdrop-blur">
                  <p className="text-sm text-muted-foreground">Perfil público</p>
                  <h2 className="mt-1 text-2xl font-extrabold">Bruna</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Golden Retriever · Vacunas al día · Contacto de emergencia disponible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="text-primary" size={22} />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{feature.text}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
