"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/services/auth";
import { adminUpdateUserSchema, signupSchema } from "@/validations/auth";

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

export async function updateAdminUser(values: unknown) {
  await requireRole("admin");
  const parsed = adminUpdateUserSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa los datos del usuario." };

  const supabaseAdmin = createAdminClient();
  const { userId, email, password, fullName, phone, role } = parsed.data;

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email,
    ...(password ? { password } : {}),
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone
    }
  });

  if (authError) return { ok: false, message: "No pudimos actualizar el acceso del usuario." };

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      email,
      role
    })
    .eq("user_id", userId);

  if (profileError) return { ok: false, message: "El acceso se actualizó, pero no pudimos actualizar el perfil." };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/edit`);
  return { ok: true, message: password ? "Usuario actualizado y contraseña restablecida." : "Usuario actualizado." };
}
