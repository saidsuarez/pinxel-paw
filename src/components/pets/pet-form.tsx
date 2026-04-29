"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Pet, Profile } from "@/types";
import { createPet, updatePet } from "@/services/actions/pets";
import { petSchema } from "@/validations/pets";

type FormValues = z.infer<typeof petSchema>;

export function PetForm({ pet, owners = [] }: { pet?: Pet; owners?: Profile[] }) {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      owner_id: pet?.owner_id,
      name: pet?.name ?? "",
      species: pet?.species ?? "Perro",
      breed: pet?.breed ?? "",
      sex: pet?.sex ?? "",
      birth_date: pet?.birth_date ?? "",
      color: pet?.color ?? "",
      weight: pet?.weight ?? "",
      photo_url: pet?.photo_url ?? "",
      nfc_enabled: pet?.nfc_enabled ?? true,
      is_public_enabled: pet?.is_public_enabled ?? true
    }
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = pet ? await updatePet(pet.id, values) : await createPet(values);
      setMessage(result?.message);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      {owners.length > 0 ? (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="owner_id">Propietario</Label>
          <select
            id="owner_id"
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            {...form.register("owner_id")}
          >
            <option value="">Seleccionar cliente</option>
            {owners.map((owner) => (
              <option key={owner.user_id} value={owner.user_id}>
                {owner.full_name ?? owner.email} - {owner.email}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <Field label="Nombre" id="name" register={form.register("name")} error={form.formState.errors.name?.message} />
      <Field label="Especie" id="species" register={form.register("species")} error={form.formState.errors.species?.message} />
      <Field label="Raza" id="breed" register={form.register("breed")} />
      <Field label="Sexo" id="sex" register={form.register("sex")} />
      <Field label="Fecha de nacimiento" id="birth_date" type="date" register={form.register("birth_date")} />
      <Field label="Color" id="color" register={form.register("color")} />
      <Field label="Peso kg" id="weight" type="number" step="0.1" register={form.register("weight")} />
      <Field label="URL foto" id="photo_url" register={form.register("photo_url")} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("nfc_enabled")} />
        NFC activo
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("is_public_enabled")} />
        Perfil público activo
      </label>
      {message ? <p className="text-sm text-destructive md:col-span-2">{message}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          {pet ? "Guardar cambios" : "Crear mascota"}
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
  type = "text",
  step
}: {
  label: string;
  id: string;
  register: object;
  error?: string;
  type?: string;
  step?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} step={step} {...register} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
