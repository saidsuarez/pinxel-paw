"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ClipboardList, Home, LogOut, PawPrint, Settings, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/actions/auth";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const customerLinks = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/pets", label: "Mascotas", icon: PawPrint },
  { href: "/records", label: "Registros", icon: ClipboardList },
  { href: "/settings", label: "Cuenta", icon: Settings }
];

const adminLinks = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/pets", label: "Mascotas", icon: PawPrint },
  { href: "/admin/records", label: "Registros", icon: ClipboardList },
  { href: "/settings", label: "Cuenta", icon: Settings }
];

export function AppShell({ profile, children }: { profile: Profile | null; children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const links = profile?.role === "admin" ? adminLinks : customerLinks;

  return (
    <div className="min-h-screen bg-muted/45 md:grid md:grid-cols-[auto_minmax(0,1fr)]">
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen flex-col border-r border-border/80 bg-background/95 p-3 shadow-sm backdrop-blur transition-[width] duration-200 md:flex",
          isCollapsed ? "w-[82px]" : "w-[260px]"
        )}
      >
        <div className={cn("flex items-center gap-3 px-2 py-2", isCollapsed && "justify-center px-0")}>
          <Link href="/dashboard" className={cn("flex min-w-0 items-center gap-3 font-bold", isCollapsed && "justify-center")} title="Paw Pinxel">
            <Image src="/pinxel-isotipo.svg" alt="" width={34} height={34} className="h-9 w-9 shrink-0" />
            {!isCollapsed ? (
              <span className="min-w-0 leading-none">
                <span className="block truncate text-[15px] text-foreground">Paw Pinxel</span>
                <span className="block truncate text-xs font-medium text-muted-foreground">by Pinxel</span>
              </span>
            ) : null}
          </Link>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute -right-5 top-6 h-10 w-10 bg-background shadow-sm"
          aria-label={isCollapsed ? "Expandir navegación" : "Contraer navegación"}
          title={isCollapsed ? "Expandir navegación" : "Contraer navegación"}
          onClick={() => setIsCollapsed((value) => !value)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>

        <nav className="mt-8 grid gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                size={isCollapsed ? "icon" : "sm"}
                className={cn("justify-start", isCollapsed && "mx-auto justify-center")}
                title={link.label}
              >
                <Link href={link.href} aria-label={isCollapsed ? link.label : undefined}>
                  <Icon size={18} />
                  {!isCollapsed ? <span>{link.label}</span> : null}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-3">
          {profile?.role === "admin" ? (
            <div className={cn("flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs font-bold text-muted-foreground", isCollapsed && "justify-center px-0")}>
              <ShieldCheck size={14} />
              {!isCollapsed ? <span>Modo admin</span> : null}
            </div>
          ) : null}
          <form action={logout}>
            <Button variant="outline" size={isCollapsed ? "icon" : "sm"} type="submit" className={cn("w-full", !isCollapsed && "justify-start")} title="Salir" aria-label={isCollapsed ? "Salir" : undefined}>
              <LogOut size={16} />
              {!isCollapsed ? <span>Salir</span> : null}
            </Button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3 font-bold">
            <Image src="/pinxel-isotipo.svg" alt="" width={30} height={30} className="h-8 w-8" />
            <span className="leading-none">
              <span className="block text-[15px] text-foreground">Paw Pinxel</span>
              <span className="block text-xs font-medium text-muted-foreground">by Pinxel</span>
            </span>
          </Link>
          <form action={logout}>
            <Button variant="outline" size="icon" type="submit" aria-label="Salir">
              <LogOut size={16} />
            </Button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Button key={link.href} asChild variant="ghost" size="sm" className="shrink-0">
                <Link href={link.href}>
                  <Icon size={16} />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
