import { z } from "zod";

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional();

export const microchipLookupSchema = z.object({
  microchipId: z
    .string()
    .trim()
    .min(1, "Enter a microchip number to search.")
    .max(80, "Microchip number must be 80 characters or fewer."),
});

export const clinicVerificationSchema = z.object({
  doctorId: optionalText(120),
  microchipMatched: z.boolean(),
  passportMatched: z.boolean(),
  visualCheckPassed: z.boolean(),
  note: optionalText(500),
});

export type MicrochipLookupFormValues = z.output<typeof microchipLookupSchema>;
export type ClinicVerificationFormValues = z.output<
  typeof clinicVerificationSchema
>;
