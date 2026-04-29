import { z } from "zod";

export const recordSchema = z.object({
  record_type: z.string().min(2, "Selecciona un tipo de registro."),
  title: z.string().min(2, "Ingresa un título."),
  description: z.string().optional(),
  date: z.string().min(1, "Ingresa la fecha."),
  veterinarian_name: z.string().optional(),
  clinic_name: z.string().optional(),
  next_due_date: z.string().optional(),
  attachment_url: z.string().url().optional().or(z.literal(""))
});
