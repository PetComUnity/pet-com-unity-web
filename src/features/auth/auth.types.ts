import { z } from "zod";

const requiredText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} must be at least ${minimum} characters.`)
    .max(maximum, `${label} must be ${maximum} characters or fewer.`);

export const registerSchema = z.object({
  name: requiredText("Name", 2, 80),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
