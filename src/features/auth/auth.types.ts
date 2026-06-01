import { z } from "zod";

const requiredText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} must be at least ${minimum} characters.`)
    .max(maximum, `${label} must be ${maximum} characters or fewer.`);

export const registerSchema = z.object({
  name: requiredText("Name", 2, 50),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(100, "Password must be 100 characters or fewer."),
  role: z.enum(["owner", "vet", "shelter", "admin"], {
    error: "Please select a role.",
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const profileUpdateFieldSchemas = {
  name: requiredText("Name", 2, 50),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(30, "Phone must be 30 characters or fewer."),
  city: z.string().trim().max(80, "City must be 80 characters or fewer."),
};

export const profileUpdateSchema = z.object(profileUpdateFieldSchemas);

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type UpdateProfileValues = z.infer<typeof profileUpdateSchema>;
export type UpdateProfilePayload = Partial<UpdateProfileValues>;
