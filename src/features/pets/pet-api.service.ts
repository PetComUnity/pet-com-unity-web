import type { Pet, PetOwnerInfo, PublicPet, UserRole } from "@/types";
import { getToken } from "@/features/auth/auth.service";
import {
  ADOPTION_ANIMAL_OPTIONS,
  getApiPetSize,
  getWeightRangeForPetSize,
  type AdoptionSearchFilters,
} from "@/features/pets/adoption-search";
import { createPublicQrId } from "@/features/pets/pet.utils";

type ApiResponse<T, M = undefined> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: M;
};

type ApiPet = Omit<
  Pet,
  | "location"
  | "owner"
  | "weight"
  | "color"
  | "gender"
  | "imageUrl"
  | "imageFileId"
  | "verifiedAt"
  | "createdAt"
  | "updatedAt"
> & {
  location?: string | null;
  city?: string | null;
  weight?: number | string | null;
  color?: string | null;
  themeColor?: string | null;
  gender?: string | null;
  imageUrl?: string | null;
  imageFileId?: string | null;
  imageFieldId?: string | null;
  owner?: ApiPetOwner | null;
  user?: ApiPetOwner | null;
  shelter?: ApiPetOwner | null;
  ownerInfo?: ApiPetOwner | null;
  contact?: ApiPetOwner | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  ownerCity?: string | null;
  ownerRole?: string | null;
  verifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ApiPetOwner = {
  id?: string | null;
  _id?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  location?: string | null;
  role?: string | null;
  imageUrl?: string | null;
  avatarUrl?: string | null;
  imageFileId?: string | null;
  avatarFileId?: string | null;
};

type ApiPetDetailsPayload =
  | ApiPet
  | {
      pet?: ApiPet | null;
      owner?: ApiPetOwner | null;
      user?: ApiPetOwner | null;
      shelter?: ApiPetOwner | null;
      ownerInfo?: ApiPetOwner | null;
      contact?: ApiPetOwner | null;
    };

type ApiPublicPet = {
  name?: string | null;
  species?: string | null;
  breed?: string | null;
  birthDate?: string | null;
  color?: string | null;
  gender?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isLost?: boolean | null;
  isAdoptable?: boolean | null;
  verificationStatus?: string | null;
  publicQrId?: string | null;
};

type ApiPublicPetDetailsPayload =
  | ApiPublicPet
  | {
      pet?: ApiPublicPet | null;
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
  isAdoptable: boolean;
  publicQrId?: string;
};

export type UpdatePetApiInput = Partial<{
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  microchipId: string | null;
  gender: string | null;
  weight: number | null;
  color: string | null;
  colorTheme: string | null;
  imageUrl: string | null;
  imageFileId: string | null;
  isLost: boolean;
  isAdoptable: boolean;
  publicQrId: string;
}>;

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

function toOptionalRole(value?: string | null): UserRole | undefined {
  return value === "owner" ||
    value === "vet" ||
    value === "shelter" ||
    value === "admin"
    ? value
    : undefined;
}

function toOptionalVerificationStatus(value?: string | null) {
  return value === "verified" || value === "unverified" ? value : undefined;
}

function mapPetOwner(owner?: ApiPetOwner | null): PetOwnerInfo | undefined {
  if (!owner) {
    return undefined;
  }

  const mappedOwner: PetOwnerInfo = {
    id: toOptionalText(owner.id ?? owner._id),
    name: toOptionalText(owner.name ?? owner.fullName),
    email: toOptionalText(owner.email),
    phone: toOptionalText(owner.phone),
    city: toOptionalText(owner.city ?? owner.location),
    role: toOptionalRole(owner.role),
    imageUrl: toOptionalText(owner.imageUrl ?? owner.avatarUrl),
    imageFileId: toOptionalText(owner.imageFileId ?? owner.avatarFileId),
  };

  return Object.values(mappedOwner).some(Boolean) ? mappedOwner : undefined;
}

function getApiPetOwner(pet: ApiPet): PetOwnerInfo | undefined {
  return (
    mapPetOwner(pet.owner) ??
    mapPetOwner(pet.user) ??
    mapPetOwner(pet.shelter) ??
    mapPetOwner(pet.ownerInfo) ??
    mapPetOwner(pet.contact) ??
    mapPetOwner({
      name: pet.ownerName,
      email: pet.ownerEmail,
      phone: pet.ownerPhone,
      city: pet.ownerCity,
      role: pet.ownerRole,
    })
  );
}

function mapPet(pet: ApiPet): Pet {
  // Migration: old pets stored the calendar theme in `color`.
  // If `themeColor` is absent but `color` is a known theme value → treat it as the theme.
  const isLegacyTheme =
    !pet.themeColor && !!pet.color && THEME_COLOR_KEYS.has(pet.color);
  const themeColor =
    toOptionalText(pet.themeColor) ?? (isLegacyTheme ? pet.color! : undefined);
  const color = isLegacyTheme ? undefined : toOptionalText(pet.color);
  const imageFileId = toOptionalText(pet.imageFileId ?? pet.imageFieldId);

  return {
    ...pet,
    color,
    themeColor,
    imageUrl: toOptionalText(pet.imageUrl),
    imageFileId,
    location: toOptionalText(pet.location ?? pet.city),
    owner: getApiPetOwner(pet),
    publicQrId: toOptionalText(pet.publicQrId) ?? "",
    weight: toOptionalNumber(pet.weight),
    gender: toOptionalText(pet.gender),
    verifiedAt: toOptionalDate(pet.verifiedAt),
    createdAt: toOptionalDate(pet.createdAt),
    updatedAt: toOptionalDate(pet.updatedAt),
  };
}

function hasWrappedPetDetailsPayload(
  payload: ApiPetDetailsPayload,
): payload is Extract<ApiPetDetailsPayload, { pet?: ApiPet | null }> {
  return "pet" in payload;
}

function mapPetDetailsPayload(payload: ApiPetDetailsPayload) {
  if (hasWrappedPetDetailsPayload(payload) && payload.pet) {
    return mapPet({
      ...payload.pet,
      owner:
        payload.pet.owner ??
        payload.owner ??
        payload.user ??
        payload.shelter ??
        payload.ownerInfo ??
        payload.contact,
    });
  }

  return mapPet(payload as ApiPet);
}

function hasWrappedPublicPetDetailsPayload(
  payload: ApiPublicPetDetailsPayload,
): payload is Extract<
  ApiPublicPetDetailsPayload,
  { pet?: ApiPublicPet | null }
> {
  return "pet" in payload;
}

function mapPublicPet(
  pet: ApiPublicPet,
  requestedPublicQrId: string,
): PublicPet {
  return {
    name: toOptionalText(pet.name) ?? "Unknown pet",
    species: toOptionalText(pet.species) ?? "Unknown",
    breed: toOptionalText(pet.breed),
    birthDate: toOptionalText(pet.birthDate),
    color: toOptionalText(pet.color),
    gender: toOptionalText(pet.gender),
    description: toOptionalText(pet.description),
    imageUrl: toOptionalText(pet.imageUrl),
    isLost: Boolean(pet.isLost),
    isAdoptable: Boolean(pet.isAdoptable),
    verificationStatus: toOptionalVerificationStatus(pet.verificationStatus),
    publicQrId: toOptionalText(pet.publicQrId) ?? requestedPublicQrId,
  };
}

function mapPublicPetDetailsPayload(
  payload: ApiPublicPetDetailsPayload,
  requestedPublicQrId: string,
) {
  if (hasWrappedPublicPetDetailsPayload(payload) && payload.pet) {
    return mapPublicPet(payload.pet, requestedPublicQrId);
  }

  return mapPublicPet(payload as ApiPublicPet, requestedPublicQrId);
}

type FetchApiOptions = {
  errorMessage?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
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

export async function getPetById(
  petId: string,
  signal?: AbortSignal,
): Promise<Pet | null> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}/pets/${petId}`, {
    cache: "no-store",
    headers,
    signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("We could not load this pet right now.");
  }

  const payload = (await response.json()) as ApiResponse<ApiPetDetailsPayload>;
  return payload.data ? mapPetDetailsPayload(payload.data) : null;
}

export async function getPetByPublicQrId(
  publicQrId: string,
  signal?: AbortSignal,
): Promise<PublicPet | null> {
  const encodedPublicQrId = encodeURIComponent(publicQrId);
  const response = await fetch(
    `${getApiBaseUrl()}/pets/public/${encodedPublicQrId}`,
    {
      cache: "no-store",
      signal,
    },
  );

  if (response.status === 404) {
    return null;
  }

  const payload = (await response
    .json()
    .catch(() => ({}))) as ApiResponse<ApiPublicPetDetailsPayload>;

  if (!response.ok) {
    throw new Error(
      payload.message ?? "We could not load this public pet page.",
    );
  }

  return payload.data
    ? mapPublicPetDetailsPayload(payload.data, publicQrId)
    : null;
}

export async function deletePet(petId: string): Promise<void> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to delete this pet.");
  }

  await fetchApi<unknown>(`/pets/${encodeURIComponent(petId)}`, {
    errorMessage: "We could not delete this pet right now.",
    method: "DELETE",
    token,
  });
}

type MyPetsPayload = ApiPet[] | { pets?: ApiPet[] };
type PetMutationPayload = ApiPet | { pet?: ApiPet };

function hasWrappedPet(
  payload: PetMutationPayload,
): payload is { pet?: ApiPet } {
  return "pet" in payload;
}

function unwrapPetPayload(payload: PetMutationPayload) {
  return hasWrappedPet(payload) ? payload.pet : payload;
}

export async function createPet(input: CreatePetApiInput): Promise<Pet | null> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to add a pet.");
  }

  const payload = await fetchApi<PetMutationPayload>("/pets", {
    body: {
      ...input,
      publicQrId: input.publicQrId?.trim() || createPublicQrId(input.name),
    },
    errorMessage: "We could not add your pet right now.",
    method: "POST",
    token,
  });

  if (!payload.data) {
    return null;
  }

  const createdPet = unwrapPetPayload(payload.data);

  return createdPet ? mapPet(createdPet) : null;
}

export async function updatePet(
  petId: string,
  input: UpdatePetApiInput,
): Promise<Pet | null> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to update this pet.");
  }

  const payload = await fetchApi<PetMutationPayload>(
    `/pets/${encodeURIComponent(petId)}`,
    {
      body: input,
      errorMessage: "We could not update this pet right now.",
      method: "PUT",
      token,
    },
  );

  if (!payload.data) {
    return null;
  }

  const updatedPet = unwrapPetPayload(payload.data);
  return updatedPet ? mapPet(updatedPet) : null;
}

export async function markPetAsLost(petId: string): Promise<Pet | null> {
  return updatePet(petId, { isLost: true });
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
