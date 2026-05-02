import { z } from "zod";
import { petProfileThemeIds } from "@/lib/pet-profile-themes";

export const petSchema = z.object({
  owner_id: z.string().uuid("Selecciona un propietario válido.").optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  species: z.string().min(2, "Ingresa la especie."),
  breed: z.string().optional(),
  sex: z.string().optional(),
  birth_date: z.string().optional(),
  color: z.string().optional(),
  weight: z.coerce.number().positive().optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
  profile_theme: z.enum(petProfileThemeIds).default("azul"),
  public_token: z
    .string()
    .trim()
    .min(3, "El enlace debe tener al menos 3 caracteres.")
    .max(36, "El enlace debe tener máximo 36 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minúsculas, números y guiones.")
    .optional()
    .or(z.literal("")),
  nfc_enabled: z.boolean(),
  is_public_enabled: z.boolean()
});

export const publicSettingsSchema = z.object({
  show_pet_photo: z.coerce.boolean().default(true),
  show_owner_name: z.coerce.boolean().default(false),
  show_owner_phone: z.coerce.boolean().default(false),
  show_emergency_contact: z.coerce.boolean().default(true),
  show_vaccination_status: z.coerce.boolean().default(true),
  show_allergies: z.coerce.boolean().default(true),
  show_medical_notes: z.coerce.boolean().default(false)
});
