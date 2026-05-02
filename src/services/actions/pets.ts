"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPublicToken, normalizePublicToken } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireUser } from "@/services/auth";
import { petSchema, publicSettingsSchema } from "@/validations/pets";

type PetMutationError = {
  code?: string;
  message?: string;
};

function getPetMutationMessage(error: PetMutationError, fallback: string) {
  if (error.code === "23505") return "Ese enlace público ya está en uso.";
  if (error.code === "23514") return "El theme seleccionado no está permitido en la base de datos.";
  if (
    error.code === "42703"
    || error.code === "PGRST204"
    || error.message?.includes("profile_theme")
  ) {
    return "Falta aplicar la migración del theme en Supabase o refrescar el schema cache.";
  }

  return fallback;
}

export async function createPet(values: unknown) {
  await requireUser();
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return { ok: false, message: "Solo el administrador puede crear mascotas." };
  }

  const parsed = petSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa los datos de la mascota." };
  if (!parsed.data.owner_id) {
    return { ok: false, message: "Selecciona el cliente propietario de la mascota." };
  }

  const supabase = await createClient();
  const token = parsed.data.public_token ? normalizePublicToken(parsed.data.public_token) : createPublicToken(parsed.data.name);

  const { data, error } = await supabase
    .from("pets")
    .insert({
      ...parsed.data,
      owner_id: parsed.data.owner_id,
      breed: parsed.data.breed || null,
      sex: parsed.data.sex || null,
      birth_date: parsed.data.birth_date || null,
      color: parsed.data.color || null,
      weight: parsed.data.weight === "" ? null : parsed.data.weight,
      photo_url: parsed.data.photo_url || null,
      profile_theme: parsed.data.profile_theme,
      public_token: token
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: getPetMutationMessage(error, "No pudimos crear la mascota. Revisa los datos e intenta de nuevo.") };

  await supabase.from("public_profile_settings").insert({ pet_id: data.id });
  revalidatePath("/pets");
  redirect(`/pets/${data.id}`);
}

export async function updatePet(id: string, values: unknown) {
  await requireUser();
  const parsed = petSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa los datos de la mascota." };
  const profile = await getCurrentProfile();

  const supabase = await createClient();
  const payload = {
    ...parsed.data,
    breed: parsed.data.breed || null,
    sex: parsed.data.sex || null,
    birth_date: parsed.data.birth_date || null,
    color: parsed.data.color || null,
    weight: parsed.data.weight === "" ? null : parsed.data.weight,
    photo_url: parsed.data.photo_url || null,
    profile_theme: parsed.data.profile_theme,
    public_token: parsed.data.public_token ? normalizePublicToken(parsed.data.public_token) : undefined
  };
  const { owner_id: _ownerId, nfc_enabled: _nfcEnabled, public_token: _publicToken, ...customerPayload } = payload;

  const { error } = await supabase
    .from("pets")
    .update(profile?.role === "admin" ? payload : customerPayload)
    .eq("id", id);

  if (error) return { ok: false, message: getPetMutationMessage(error, "No pudimos guardar los cambios. Revisa los datos e intenta de nuevo.") };
  revalidatePath(`/pets/${id}`);
  redirect(`/pets/${id}`);
}

export async function checkPublicTokenAvailability(token: string, currentPetId?: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return { ok: false, message: "Solo el administrador puede validar enlaces." };
  }

  const normalizedToken = normalizePublicToken(token);
  if (normalizedToken.length < 3) {
    return { ok: false, available: false, token: normalizedToken, message: "El enlace debe tener al menos 3 caracteres." };
  }

  const supabase = await createClient();
  let query = supabase.from("pets").select("id").eq("public_token", normalizedToken).limit(1);
  if (currentPetId) query = query.neq("id", currentPetId);
  const { data, error } = await query;

  if (error) return { ok: false, available: false, token: normalizedToken, message: "No pudimos validar el enlace." };
  const available = (data ?? []).length === 0;

  return {
    ok: true,
    available,
    token: normalizedToken,
    message: available ? "Enlace disponible." : "Ese enlace público ya está en uso."
  };
}

export async function updatePublicSettings(petId: string, values: unknown) {
  await requireUser();
  const parsed = publicSettingsSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa la configuración pública." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("public_profile_settings")
    .upsert({ pet_id: petId, ...parsed.data }, { onConflict: "pet_id" });

  if (error) return { ok: false, message: "No pudimos actualizar la privacidad. Intenta de nuevo." };
  revalidatePath(`/pets/${petId}`);
  return { ok: true, message: "Privacidad actualizada." };
}
