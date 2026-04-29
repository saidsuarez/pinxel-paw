"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, resetPasswordSchema, signupSchema } from "@/validations/auth";

export type ActionState = {
  ok: boolean;
  message?: string;
};

export async function login(values: unknown): Promise<ActionState> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa el correo y la contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: error.message };

  redirect("/dashboard");
}

export async function signup(values: unknown): Promise<ActionState> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Revisa los datos del formulario." };

  const supabase = await createClient();
  const { email, password, fullName, phone } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      }
    }
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Cuenta creada. Revisa tu correo si Supabase requiere confirmación." };
}

export async function requestPasswordReset(values: unknown): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Ingresa un correo válido." };

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/login`
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Te enviamos las instrucciones de recuperación." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
