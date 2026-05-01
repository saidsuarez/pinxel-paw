"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/actions/auth";
import { loginSchema } from "@/validations/auth";

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await login(values);
      setMessage(result?.message);
    });
  }

  return (
    <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" autoComplete="current-password" spellCheck={false} {...form.register("password")} />
        <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
      </div>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        Entrar
      </Button>
      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground">
          Recuperar acceso
        </Link>
        <Link href="/register" className="hover:text-foreground">
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}
