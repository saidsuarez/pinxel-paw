"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updatePublicSettings } from "@/services/actions/pets";
import type { PublicProfileSettings } from "@/types";

const fields = [
  ["show_pet_photo", "Mostrar foto"],
  ["show_owner_name", "Mostrar nombre del dueño"],
  ["show_owner_phone", "Mostrar teléfono"],
  ["show_emergency_contact", "Mostrar contacto de emergencia"],
  ["show_vaccination_status", "Mostrar estado de vacunas"],
  ["show_allergies", "Mostrar alergias"],
  ["show_medical_notes", "Mostrar notas médicas"]
] as const;

export function PublicSettingsForm({ petId, settings }: { petId: string; settings: PublicProfileSettings | null }) {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const values = Object.fromEntries(fields.map(([name]) => [name, formData.has(name)]));
    startTransition(async () => {
      const result = await updatePublicSettings(petId, values);
      setMessage(result?.message);
    });
  }

  return (
    <form action={onSubmit} className="space-y-3">
      {fields.map(([name, label]) => (
        <label key={name} className="flex items-center gap-2 text-sm">
          <input name={name} type="checkbox" defaultChecked={settings?.[name] ?? true} />
          {label}
        </label>
      ))}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" variant="outline" disabled={isPending}>
        Guardar privacidad
      </Button>
    </form>
  );
}
