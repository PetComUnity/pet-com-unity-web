import { z } from "zod";

const requiredText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} must be at least ${minimum} characters.`)
    .max(maximum, `${label} must be ${maximum} characters or fewer.`);

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
    role: z.enum(["owner", "vet", "shelter", "admin", ""]),
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const profileUpdateFieldSchemas = {
  name: requiredText("Name", 2, 80),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(30, "Phone must be 30 characters or fewer."),
  city: z.string().trim().max(120, "Address must be 120 characters or fewer."),
  website: z
    .string()
    .trim()
    .max(120, "Website must be 120 characters or fewer."),
  socialLinks: z
    .string()
    .trim()
    .max(180, "Social links must be 180 characters or fewer."),
  operatingHours: z
    .string()
    .trim()
    .max(120, "Operating hours must be 120 characters or fewer."),
  registrationNumber: z
    .string()
    .trim()
    .max(80, "Registration number must be 80 characters or fewer."),
};

export const profileUpdateSchema = z.object(profileUpdateFieldSchemas);

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters.")
      .max(100, "New password must be 100 characters or fewer."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type UpdateProfileValues = z.infer<typeof profileUpdateSchema>;
export type UpdateProfilePayload = Partial<UpdateProfileValues> &
  Partial<{
    avatarFileId: string | null;
    avatarUrl: string | null;
  }>;
export type ChangePasswordValues = z.infer<typeof passwordChangeSchema>;
export type ChangePasswordPayload = Pick<
  ChangePasswordValues,
  "currentPassword" | "newPassword"
>;