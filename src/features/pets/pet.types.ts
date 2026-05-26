import type { Pet } from "@/types";

export type CreatePetInput = {
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  location?: string;
  weight?: number;
  color?: string;
  description?: string;
  imageUrl?: string;
  microchipId?: string;
  isLost?: boolean;
  isAdoptable?: boolean;
  publicQrId: string;
};

export type UpdatePetInput = Partial<
  Omit<CreatePetInput, "ownerId" | "publicQrId"> & {
    publicQrId: string;
  }
>;

export type PetListItem = Pick<
  Pet,
  | "id"
  | "name"
  | "species"
  | "breed"
  | "imageUrl"
  | "isLost"
  | "verificationStatus"
  | "publicQrId"
  | "updatedAt"
>;
