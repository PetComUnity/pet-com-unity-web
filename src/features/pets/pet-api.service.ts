import type { Pet } from "@/types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type ApiPet = Omit<Pet, "verifiedAt" | "createdAt" | "updatedAt"> & {
  verifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

function toOptionalDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function mapPet(pet: ApiPet): Pet {
  return {
    ...pet,
    verifiedAt: toOptionalDate(pet.verifiedAt),
    createdAt: toOptionalDate(pet.createdAt),
    updatedAt: toOptionalDate(pet.updatedAt),
  };
}

async function fetchPets<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("We could not load adoptable pets right now.");
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data as T;
}

export async function getAdoptablePets(): Promise<Pet[]> {
  const pets = await fetchPets<ApiPet[]>("/pets?isAdoptable=true");
  return Array.isArray(pets) ? pets.map(mapPet) : [];
}

export async function getPetById(petId: string): Promise<Pet | null> {
  const response = await fetch(`${getApiBaseUrl()}/pets/${petId}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("We could not load this pet right now.");
  }

  const payload = (await response.json()) as ApiResponse<ApiPet>;
  return payload.data ? mapPet(payload.data) : null;
}
