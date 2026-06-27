import { ApiRequestError, apiRequest } from "@/lib/api";
import { getToken } from "@/features/auth/auth.service";
import type {
  SubmitVerificationInput,
  VerificationLookupPet,
  VerificationStatus,
} from "@/features/clinic-verification/clinic-verification.types";

type RawVerificationPet = {
  id?: string | null;
  _id?: string | null;
  name?: string | null;
  species?: string | null;
  breed?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  birthDate?: string | null;
  age?: string | number | null;
  imageUrl?: string | null;
  photoUrl?: string | null;
  microchipNumber?: string | null;
  microchipId?: string | null;
  chip?: string | null;
  passportNumber?: string | null;
  passportId?: string | null;
  verificationStatus?: string | null;
  verifiedAt?: string | null;
  verifiedClinicName?: string | null;
  clinicName?: string | null;
  verifiedClinic?: {
    name?: string | null;
  } | null;
};

type LookupPayload =
  | RawVerificationPet
  | {
      pet?: RawVerificationPet | null;
    };

type SubmitPayload =
  | RawVerificationPet
  | {
      pet?: RawVerificationPet | null;
      verification?: RawVerificationPet | null;
    };

function requireToken() {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to verify pets.");
  }

  return token;
}

function toOptionalText(value?: string | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function toVerificationStatus(
  value?: string | null,
): VerificationStatus {
  return value === "pending" || value === "verified" || value === "rejected"
    ? value
    : "unverified";
}

function getSafeImageUrl(value?: string | null) {
  const imageUrl = toOptionalText(value);

  if (!imageUrl) {
    return undefined;
  }

  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  try {
    const parsedUrl = new URL(imageUrl);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
      ? imageUrl
      : undefined;
  } catch {
    return undefined;
  }
}

function unwrapLookupPayload(
  payload: LookupPayload | undefined,
): RawVerificationPet | null {
  if (!payload) {
    return null;
  }

  return "pet" in payload ? payload.pet ?? null : (payload as RawVerificationPet);
}

function unwrapSubmitPayload(payload: SubmitPayload | undefined) {
  if (!payload) {
    return null;
  }

  if ("pet" in payload && payload.pet) {
    return payload.pet;
  }

  if ("verification" in payload && payload.verification) {
    return payload.verification;
  }

  return payload as RawVerificationPet;
}

function hasPetPreviewShape(pet: RawVerificationPet) {
  return Boolean(
    toOptionalText(pet.id ?? pet._id) ||
      toOptionalText(pet.name) ||
      toOptionalText(pet.species),
  );
}

export function mapVerificationLookupPet(
  pet: RawVerificationPet,
): VerificationLookupPet {
  return {
    id: toOptionalText(pet.id ?? pet._id) ?? "",
    name: toOptionalText(pet.name) ?? "Unknown pet",
    species: toOptionalText(pet.species) ?? "Unknown",
    breed: toOptionalText(pet.breed),
    gender: toOptionalText(pet.gender),
    dateOfBirth: toOptionalText(pet.dateOfBirth ?? pet.birthDate),
    age: pet.age ?? undefined,
    imageUrl: getSafeImageUrl(pet.imageUrl ?? pet.photoUrl),
    microchipId: toOptionalText(
      pet.microchipId ?? pet.microchipNumber ?? pet.chip,
    ),
    passportNumber: toOptionalText(pet.passportNumber ?? pet.passportId),
    verificationStatus: toVerificationStatus(pet.verificationStatus),
    verifiedAt: toOptionalText(pet.verifiedAt),
    verifiedClinicName: toOptionalText(
      pet.verifiedClinicName ?? pet.clinicName ?? pet.verifiedClinic?.name,
    ),
  };
}

export async function lookupPetByMicrochipId(
  microchipId: string,
  signal?: AbortSignal,
): Promise<VerificationLookupPet | null> {
  const token = requireToken();
  const query = new URLSearchParams({
    microchipId: microchipId.trim(),
  });

  try {
    const payload = await apiRequest<LookupPayload>(
      `/clinics/pets/lookup?${query.toString()}`,
      { signal, token },
    );
    const pet = unwrapLookupPayload(payload);

    return pet ? mapVerificationLookupPet(pet) : null;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function submitPetVerification(
  petId: string,
  input: SubmitVerificationInput,
): Promise<VerificationLookupPet | null> {
  const token = requireToken();
  const payload = await apiRequest<SubmitPayload>(
    `/clinics/pets/${encodeURIComponent(petId)}/verify`,
    {
      method: "POST",
      body: input,
      token,
    },
  );
  const pet = unwrapSubmitPayload(payload);

  return pet && hasPetPreviewShape(pet) ? mapVerificationLookupPet(pet) : null;
}
