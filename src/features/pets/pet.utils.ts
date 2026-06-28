import { getPublicPetRoute } from "@/constants/routes";
import type { PetVerificationStatus } from "@/types";
import type { PetFormValues } from "@/features/pets/pet.schema";

export const PET_SPECIES_OPTIONS = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Reptile",
  "Other",
] as const;

export function createPublicQrId(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);

  return `${slug || "pet"}-${suffix}`;
}

export function toPetPayload(values: PetFormValues) {
  return {
    name: values.name.trim(),
    species: values.species.trim(),
    breed: values.breed,
    birthDate: values.birthDate,
    color: values.color,
    description: values.description,
    microchipId: values.microchipId,
    isAdoptable: values.isAdoptable,
  };
}

export function getVerificationLabel(status: PetVerificationStatus) {
  switch (status) {
    case "pending":
      return "Pending verification";
    case "verified":
      return "Verified by veterinary clinic";
    case "rejected":
      return "Verification rejected";
    case "unverified":
      return "Not verified";
  }
}

export function buildPublicPetPath(publicQrId: string) {
  return getPublicPetRoute(publicQrId);
}
