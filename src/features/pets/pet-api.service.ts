import type { Pet } from "@/types";
import { getToken } from "@/features/auth/auth.service";
import {
  ADOPTION_ANIMAL_OPTIONS,
  getApiPetSize,
  getWeightRangeForPetSize,
  type AdoptionSearchFilters,
} from "@/features/pets/adoption-search";

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

export type CreatePetApiInput = {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  microchipId?: string;
  gender?: string;
  weight?: number;
  color?: string;
  themeColor?: string;
  imageUrl?: string;
  imageFileId?: string;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
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

const THEME_COLOR_KEYS = new Set([
  "None",
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Teal",
  "Blue",
  "Purple",
  "Pink",
  "Brown",
]);

function mapPet(pet: ApiPet): Pet {
  // Migration: old pets stored the calendar theme in `color`.
  // If `themeColor` is absent but `color` is a known theme value → treat it as the theme.
  const isLegacyTheme =
    !pet.themeColor && !!pet.color && THEME_COLOR_KEYS.has(pet.color);
  const themeColor =
    toOptionalText(pet.themeColor) ?? (isLegacyTheme ? pet.color! : undefined);
  const color = isLegacyTheme ? undefined : toOptionalText(pet.color);

  return {
    ...pet,
    color,
    themeColor,
    location: toOptionalText(pet.location ?? pet.city),
    weight: toOptionalNumber(pet.weight),
    verifiedAt: toOptionalDate(pet.verifiedAt),
    createdAt: toOptionalDate(pet.createdAt),
    updatedAt: toOptionalDate(pet.updatedAt),
  };
}

type FetchApiOptions = {
  errorMessage?: string;
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  token?: string;
};

async function fetchApi<T, M = undefined>(
  path: string,
  options: FetchApiOptions = {},
): Promise<ApiResponse<T, M>> {
  const { body, errorMessage, method = "GET", signal, token } = options;
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<
    T,
    M
  >;

  if (!response.ok) {
    throw new Error(
      payload.message ?? errorMessage ?? "We could not load pets right now.",
    );
  }

  return payload;
}

function buildAdoptablePetsQuery(
  page: number,
  limit: number,
  filters: AdoptionSearchFilters,
) {
  const query = new URLSearchParams({
    isAdoptable: "true",
    page: String(page),
    limit: String(limit),
  });

  if (filters.animal !== "") {
    const selectedAnimal = ADOPTION_ANIMAL_OPTIONS.find(
      (option) => option.value === filters.animal,
    );

    query.set("species", selectedAnimal?.label ?? filters.animal);
    query.set("animal", filters.animal);
  }

  const normalizedLocation = filters.location.trim();
  if (normalizedLocation !== "") {
    query.set("location", normalizedLocation);
    query.set("city", normalizedLocation);
  }

  if (filters.size !== "") {
    const weightRange = getWeightRangeForPetSize(filters.size);
    query.set("size", getApiPetSize(filters.size));

    if (typeof weightRange.minWeight === "number") {
      query.set("minWeight", String(weightRange.minWeight));
    }

    if (typeof weightRange.maxWeight === "number") {
      query.set("maxWeight", String(weightRange.maxWeight));
    }
  }

  return query;
}

export async function getAdoptablePets(
  page: number,
  limit: number,
  filters: AdoptionSearchFilters,
  signal?: AbortSignal,
): Promise<PaginatedPetsResult> {
  const query = buildAdoptablePetsQuery(page, limit, filters);
  const payload = await fetchApi<ApiPet[], PaginationMeta>(
    `/pets?${query.toString()}`,
    {
      errorMessage: "We could not load adoptable pets right now.",
      signal,
    },
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

export async function getAllAdoptablePets(
  filters: AdoptionSearchFilters,
  limit = 50,
  signal?: AbortSignal,
) {
  const firstPage = await getAdoptablePets(1, limit, filters, signal);

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.pets;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      getAdoptablePets(index + 2, limit, filters, signal),
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

type MyPetsPayload = ApiPet[] | { pets?: ApiPet[] };
type CreatedPetPayload = ApiPet | { pet?: ApiPet };

function hasWrappedPet(
  payload: CreatedPetPayload,
): payload is { pet?: ApiPet } {
  return "pet" in payload;
}

export async function createPet(input: CreatePetApiInput): Promise<Pet | null> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to add a pet.");
  }

  const payload = await fetchApi<CreatedPetPayload>("/pets", {
    body: input,
    errorMessage: "We could not add your pet right now.",
    method: "POST",
    token,
  });

  if (!payload.data) {
    return null;
  }

  const createdPet: ApiPet | undefined = hasWrappedPet(payload.data)
    ? payload.data.pet
    : payload.data;

  return createdPet ? mapPet(createdPet) : null;
}

type UploadType = "public" | "private" | "document";

type UploadResult =
  | { type: "public"; url: string }
  | { type: "private" | "document"; fileId: string };

export async function uploadPetImage(
  file: File,
  uploadType: UploadType = "private",
): Promise<UploadResult> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to upload an image.");
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", uploadType);

  const response = await fetch(`${getApiBaseUrl()}/upload/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<{
    url?: string;
    fileId?: string;
  }>;

  if (!response.ok) {
    throw new Error(payload.message ?? "We could not upload the image.");
  }

  if (uploadType === "public") {
    if (!payload.data?.url)
      throw new Error("Upload succeeded but no URL was returned.");
    return { type: "public", url: payload.data.url };
  }

  if (!payload.data?.fileId)
    throw new Error("Upload succeeded but no fileId was returned.");
  return { type: uploadType, fileId: payload.data.fileId };
}

export async function getMyPets(signal?: AbortSignal): Promise<Pet[]> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to view your pets.");
  }

  const payload = await fetchApi<MyPetsPayload>("/me/pets", {
    errorMessage: "We could not load your pets right now.",
    signal,
    token,
  });

  const pets = Array.isArray(payload.data) ? payload.data : payload.data?.pets;

  return Array.isArray(pets) ? pets.map(mapPet) : [];
}

export async function getLostPets() {
  const payload = await fetchApi<ApiPet[], PaginationMeta>(
    "/pets?page=1&limit=20",
    {
      errorMessage: "We could not load lost pets right now.",
    },
  );

  const pets = Array.isArray(payload.data) ? payload.data.map(mapPet) : [];

  return pets.filter((pet) => pet.isLost);
}
