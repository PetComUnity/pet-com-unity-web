import type { PetVerificationStatus } from "@/types";

export type VerificationStatus = PetVerificationStatus;

export type VerificationDecision = "verified" | "pending" | "rejected";

export type VerificationLookupPet = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  age?: string | number;
  imageUrl?: string;
  imageFileId?: string;
  microchipId?: string;
  passportNumber?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedClinicName?: string;
};

export type SubmitVerificationInput = {
  microchipId: string;
  result: VerificationDecision;
  microchipMatched: boolean;
  passportMatched: boolean;
  visualCheckPassed: boolean;
  note?: string;
  doctorId?: string;
  doctorName?: string;
};

export type VerificationDoctor = {
  id: string;
  name: string;
};
