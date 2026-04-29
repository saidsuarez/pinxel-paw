"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomer } from "@/services/actions/users";
import { signupSchema } from "@/validations/auth";

type FormValues = z.infer<typeof signupSchema>;

export function AdminUserForm() {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", phone: "", email: "", password: "" }
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createCustomer(values);
      setMessage(result?.message);
      if (result?.ok) form.reset();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
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
        <Label htmlFor="password">Contraseña temporal</Label>
        <Input id="password" type="password" {...form.register("password")} />
      </div>
      {message ? <p className="text-sm text-muted-foreground md:col-span-2">{message}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          Crear usuario
        </Button>
      </div>
    </form>
  );
}
