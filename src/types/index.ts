export const USER_ROLES = ["owner", "vet", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type PetVerificationStatus = "unverified" | "verified";
export type LostReportStatus = "active" | "resolved";

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  city?: string;
  createdAt?: Date | null;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  color?: string;
  description?: string;
  imageUrl?: string;
  microchipId?: string;
  isLost: boolean;
  isAdoptable: boolean;
  verificationStatus: PetVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date | null;
  publicQrId: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface LostReport {
  id: string;
  petId: string;
  ownerId: string;
  city: string;
  lastSeenLocation?: string;
  dateLost?: string;
  message?: string;
  status: LostReportStatus;
  createdAt?: Date | null;
}

export type PublicPet = Pick<
  Pet,
  | "id"
  | "name"
  | "species"
  | "breed"
  | "color"
  | "description"
  | "imageUrl"
  | "isLost"
  | "verificationStatus"
  | "publicQrId"
>;
