import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/actions/auth";
import type { Profile } from "@/types";

const customerLinks = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/pets", label: "Mascotas" },
  { href: "/settings", label: "Cuenta" }
];

const adminLinks = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/pets", label: "Mascotas" },
  { href: "/admin/records", label: "Registros" }
];

export function AppShell({ profile, children }: { profile: Profile | null; children: React.ReactNode }) {
  const links = profile?.role === "admin" ? [...customerLinks, ...adminLinks] : customerLinks;

  return (
    <div className="min-h-screen bg-muted/45">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3 font-bold">
            <Image src="/pinxel-isotipo.svg" alt="" width={30} height={30} className="h-8 w-8" />
            <span className="leading-none">
              <span className="block text-[15px] text-foreground">Paw Pinxel</span>
              <span className="block text-xs font-medium text-muted-foreground">by Pinxel</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Button key={link.href} asChild variant="ghost" size="sm">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Salir
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      {profile?.role === "admin" ? (
        <div className="fixed bottom-4 right-4 hidden items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-bold text-muted-foreground shadow-sm md:flex">
          <ShieldCheck size={14} />
          Modo admin
        </div>
      ) : null}
    </div>
  );
}
