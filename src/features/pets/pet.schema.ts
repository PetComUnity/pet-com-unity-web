import { z } from "zod";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().max(maximum).optional(),
  );

export const petFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Pet name must be at least 2 characters.")
    .max(80, "Pet name must be 80 characters or fewer."),
  species: z
    .string()
    .trim()
    .min(2, "Species is required.")
    .max(40, "Species must be 40 characters or fewer."),
  breed: optionalText(80),
  birthDate: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return value.trim() === "" ? undefined : value;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format.").optional(),
  ),
  color: optionalText(60),
  description: optionalText(500),
  microchipId: optionalText(80),
  isAdoptable: z.boolean().default(false),
});

export type PetFormInput = z.input<typeof petFormSchema>;
export type PetFormValues = z.output<typeof petFormSchema>;
