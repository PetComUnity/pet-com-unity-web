import type { Pet } from "@/types";

type ApiResponse<T, M = undefined> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: M;
};

type ApiPet = Omit<
  Pet,
  "location" | "weight" | "verifiedAt" | "createdAt" | "updatedAt"
> & {
  location?: string | null;
  city?: string | null;
  weight?: number | string | null;
  verifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedPetsResult = {
  pets: Pet[];
  meta: PaginationMeta;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );
}

function toOptionalDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function toOptionalNumber(value?: number | string | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
}

function toOptionalText(value?: string | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function mapPet(pet: ApiPet): Pet {
  return {
    ...pet,
    location: toOptionalText(pet.location ?? pet.city),
    weight: toOptionalNumber(pet.weight),
    verifiedAt: toOptionalDate(pet.verifiedAt),
    createdAt: toOptionalDate(pet.createdAt),
    updatedAt: toOptionalDate(pet.updatedAt),
  };
}

async function fetchApi<T, M = undefined>(
  path: string,
): Promise<ApiResponse<T, M>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("We could not load adoptable pets right now.");
  }

  return (await response.json()) as ApiResponse<T, M>;
}

export async function getAdoptablePets(
  page: number,
  limit: number,
): Promise<PaginatedPetsResult> {
  const query = new URLSearchParams({
    isAdoptable: "true",
    page: String(page),
    limit: String(limit),
  });
  const payload = await fetchApi<ApiPet[], PaginationMeta>(
    `/pets?${query.toString()}`,
  );
  const pets = Array.isArray(payload.data) ? payload.data.map(mapPet) : [];

  return {
    pets,
    meta: payload.meta ?? {
      page,
      limit,
      total: pets.length,
      totalPages: pets.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAllAdoptablePets(limit = 50) {
  const firstPage = await getAdoptablePets(1, limit);

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.pets;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      getAdoptablePets(index + 2, limit),
    ),
  );

  return [
    ...firstPage.pets,
    ...remainingPages.flatMap((result) => result.pets),
  ];
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
