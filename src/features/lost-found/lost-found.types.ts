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

export const lostReportSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(80, "City must be 80 characters or fewer."),
  lastSeenLocation: optionalText(140),
  dateLost: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return value.trim() === "" ? undefined : value;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format.").optional(),
  ),
  message: optionalText(500),
});

export type LostReportFormValues = z.infer<typeof lostReportSchema>;
