"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPublicToken } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireUser } from "@/services/auth";
import { petSchema, publicSettingsSchema } from "@/validations/pets";

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
  const token = createPublicToken(parsed.data.name);

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
      public_token: token
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: "No pudimos crear la mascota. Revisa los datos e intenta de nuevo." };

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
    photo_url: parsed.data.photo_url || null
  };
  const { owner_id: _ownerId, nfc_enabled: _nfcEnabled, ...customerPayload } = payload;

  const { error } = await supabase
    .from("pets")
    .update(profile?.role === "admin" ? payload : customerPayload)
    .eq("id", id);

  if (error) return { ok: false, message: "No pudimos guardar los cambios. Revisa los datos e intenta de nuevo." };
  revalidatePath(`/pets/${id}`);
  redirect(`/pets/${id}`);
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
