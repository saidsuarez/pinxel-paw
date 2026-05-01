"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/services/auth";
import { signupSchema } from "@/validations/auth";

export async function createCustomer(values: unknown) {
  await requireRole("admin");
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa los datos del usuario." };

  const supabaseAdmin = createAdminClient();
  const { email, password, fullName, phone } = parsed.data;
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone
    }
  });

  if (error) return { ok: false, message: "No pudimos crear el usuario. Revisa los datos e intenta de nuevo." };
  revalidatePath("/admin/users");
  return { ok: true, message: "Usuario creado." };
}
