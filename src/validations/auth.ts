import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.")
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Ingresa el nombre completo."),
  phone: z.string().optional()
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido.")
});
