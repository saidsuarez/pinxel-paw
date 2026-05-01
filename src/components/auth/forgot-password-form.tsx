"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/services/actions/auth";
import { resetPasswordSchema } from "@/validations/auth";

type FormValues = z.infer<typeof resetPasswordSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { email: "" } });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      setMessage(result?.message);
    });
  }

  return (
    <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" type="email" {...form.register("email")} />
        <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        Enviar recuperación
      </Button>
    </form>
  );
}
