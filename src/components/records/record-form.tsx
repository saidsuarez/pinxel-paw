"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createVeterinaryRecord } from "@/services/actions/records";
import { recordSchema } from "@/validations/records";

type FormValues = z.infer<typeof recordSchema>;

export function RecordForm({ petId, redirectTo }: { petId: string; redirectTo?: string }) {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      record_type: "vacuna",
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      veterinarian_name: "",
      clinic_name: "",
      next_due_date: "",
      attachment_url: ""
    }
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createVeterinaryRecord(petId, values, redirectTo);
      setMessage(result?.message);
    });
  }

  return (
    <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="record_type">Tipo</Label>
        <select id="record_type" className="h-12 w-full rounded-full border border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15" {...form.register("record_type")}>
          <option value="vacuna">Vacuna</option>
          <option value="alergia">Alergia</option>
          <option value="consulta">Consulta</option>
          <option value="medicamento">Medicamento</option>
          <option value="nota">Nota médica</option>
        </select>
      </div>
      <Field label="Título" id="title" register={form.register("title")} error={form.formState.errors.title?.message} />
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>
      <Field label="Fecha" id="date" type="date" register={form.register("date")} error={form.formState.errors.date?.message} />
      <Field label="Próxima fecha" id="next_due_date" type="date" register={form.register("next_due_date")} />
      <Field label="Veterinario" id="veterinarian_name" register={form.register("veterinarian_name")} />
      <Field label="Clínica" id="clinic_name" register={form.register("clinic_name")} />
      <Field label="Adjunto URL" id="attachment_url" register={form.register("attachment_url")} />
      {message ? <p className="text-sm text-destructive md:col-span-2">{message}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          Crear registro
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  register,
  error,
  type = "text"
}: {
  label: string;
  id: string;
  register: object;
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} {...register} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
