import Link from "next/link";
import { HeartPulse, LockKeyhole, Nfc, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: Nfc, title: "Perfil NFC", text: "Una URL pública limitada para identificar a la mascota al escanear el sticker." },
  { icon: HeartPulse, title: "Historial médico", text: "Registros veterinarios organizados para vacunas, consultas, alergias y notas." },
  { icon: LockKeyhole, title: "Privacidad", text: "El cliente decide qué datos se muestran públicamente." }
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b bg-[linear-gradient(120deg,#f7f2e8_0%,#ffffff_54%,#fbe3dc_100%)]">
        <div className="mx-auto grid min-h-[78vh] max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm">
              <PawPrint size={16} />
              paw.pinxel.co
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">Paw Pinxel</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Registros veterinarios digitales para mascotas, conectados a stickers NFC y pensados para que cada familia tenga la información importante a mano.
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
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="aspect-[4/3] rounded-md bg-[radial-gradient(circle_at_28%_24%,#f8b95b_0_13%,transparent_14%),radial-gradient(circle_at_70%_38%,#15917f_0_16%,transparent_17%),linear-gradient(135deg,#ffffff,#f7efe2)] p-6">
              <div className="flex h-full flex-col justify-end">
                <div className="rounded-lg border bg-white/90 p-5 shadow-sm backdrop-blur">
                  <p className="text-sm text-muted-foreground">Perfil NFC</p>
                  <h2 className="mt-1 text-2xl font-semibold">Bruna</h2>
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
