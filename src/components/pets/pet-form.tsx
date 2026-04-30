"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Pet, Profile } from "@/types";
import { createPet, updatePet } from "@/services/actions/pets";
import { petSchema } from "@/validations/pets";

type FormValues = z.infer<typeof petSchema>;
const maxPhotoSize = 5 * 1024 * 1024;

export function PetForm({ pet, owners = [] }: { pet?: Pet; owners?: Profile[] }) {
  const [message, setMessage] = useState<string>();
  const [uploadMessage, setUploadMessage] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
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
  const photoUrl = form.watch("photo_url");

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = pet ? await updatePet(pet.id, values) : await createPet(values);
      setMessage(result?.message);
    });
  }

  async function uploadPhoto(file?: File) {
    if (!file) return;
    setUploadMessage(undefined);

    if (!file.type.startsWith("image/")) {
      setUploadMessage("Selecciona una imagen válida.");
      return;
    }

    if (file.size > maxPhotoSize) {
      setUploadMessage("La foto debe pesar máximo 5 MB.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setUploadMessage("Inicia sesión para subir fotos.");
      setIsUploading(false);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `${crypto.randomUUID()}.${extension}`;
    const path = `${user.id}/${safeName}`;
    const { error } = await supabase.storage.from("pet-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      setUploadMessage(error.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
    form.setValue("photo_url", data.publicUrl, { shouldDirty: true, shouldValidate: true });
    setUploadMessage("Foto cargada correctamente.");
    setIsUploading(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      {owners.length > 0 ? (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="owner_id">Propietario</Label>
          <select
            id="owner_id"
            className="h-12 w-full rounded-full border border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
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
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="photo">Foto de la mascota</Label>
        <Input
          id="photo"
          type="file"
          accept="image/*"
          disabled={isUploading}
          className="rounded-2xl py-3"
          onChange={(event) => uploadPhoto(event.target.files?.[0])}
        />
        <input type="hidden" {...form.register("photo_url")} />
        {uploadMessage ? <p className="text-xs text-muted-foreground">{uploadMessage}</p> : null}
        {photoUrl ? (
          <div className="flex items-center gap-3 rounded-2xl border bg-white p-3">
            <Image src={photoUrl} alt="Foto de la mascota" width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 text-sm">
              <p className="font-medium">Foto lista</p>
              <p className="truncate text-muted-foreground">{photoUrl}</p>
            </div>
          </div>
        ) : null}
      </div>
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
