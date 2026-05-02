"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAdminUser } from "@/services/actions/users";
import type { Profile } from "@/types";
import { adminUpdateUserSchema } from "@/validations/auth";

type FormValues = z.input<typeof adminUpdateUserSchema>;

export function AdminUserEditForm({ profile }: { profile: Profile }) {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: {
      userId: profile.user_id,
      fullName: profile.full_name ?? "",
      phone: profile.phone ?? "",
      email: profile.email,
      role: profile.role,
      password: ""
    }
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await updateAdminUser(values);
      setMessage(result?.message);
      if (result?.ok) form.reset({ ...values, password: "" });
    });
  }

  return (
    <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" {...form.register("userId")} />
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre</Label>
        <Input id="fullName" {...form.register("fullName")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" {...form.register("phone")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...form.register("role")}
        >
          <option value="customer">Cliente</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="password">Nueva contraseña temporal</Label>
        <Input id="password" type="password" autoComplete="new-password" spellCheck={false} {...form.register("password")} />
        <p className="text-xs text-muted-foreground">Déjala vacía si no quieres cambiar la contraseña.</p>
      </div>
      {message ? <p className="text-sm text-muted-foreground md:col-span-2">{message}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
