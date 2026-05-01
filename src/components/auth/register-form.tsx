"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/services/actions/auth";
import { signupSchema } from "@/validations/auth";

type FormValues = z.infer<typeof signupSchema>;

export function RegisterForm() {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", phone: "", email: "", password: "" }
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await signup(values);
      setMessage(result?.message);
    });
  }

  return (
    <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
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
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" autoComplete="new-password" spellCheck={false} {...form.register("password")} />
      </div>
      {Object.values(form.formState.errors).map((error, index) => (
        <p key={index} className="text-xs text-destructive">
          {error.message}
        </p>
      ))}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        Crear cuenta
      </Button>
    </form>
  );
}
