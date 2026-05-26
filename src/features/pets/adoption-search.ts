export type PetSize = "small" | "medium" | "large";

export type AdoptionSearchFilters = {
  animal: string;
  size: PetSize | "";
  location: string;
};

export const DEFAULT_ADOPTION_SEARCH_FILTERS: AdoptionSearchFilters = {
  animal: "",
  size: "",
  location: "",
};

export const ADOPTION_ANIMAL_OPTIONS = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
  { label: "Rabbit", value: "rabbit" },
  { label: "Bird", value: "bird" },
] as const;

export const ADOPTION_SIZE_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
] as const;

const SMALL_PET_MAX_WEIGHT = 10;
const MEDIUM_PET_MAX_WEIGHT = 25;

export function getPetSizeFromWeight(weight?: number | null): PetSize | null {
  if (typeof weight !== "number" || Number.isNaN(weight) || weight <= 0) {
    return null;
  }

  if (weight <= SMALL_PET_MAX_WEIGHT) {
    return "small";
  }

  if (weight <= MEDIUM_PET_MAX_WEIGHT) {
    return "medium";
  }

  return "large";
}
