"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/services/auth";
import { recordSchema } from "@/validations/records";

export async function createVeterinaryRecord(petId: string, values: unknown) {
  await requireUser();
  const parsed = recordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa los datos del registro." };

  const supabase = await createClient();
  const { error } = await supabase.from("veterinary_records").insert({
    pet_id: petId,
    ...parsed.data,
    description: parsed.data.description || null,
    veterinarian_name: parsed.data.veterinarian_name || null,
    clinic_name: parsed.data.clinic_name || null,
    next_due_date: parsed.data.next_due_date || null,
    attachment_url: parsed.data.attachment_url || null
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}/records`);
}
