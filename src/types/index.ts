export const USER_ROLES = ["owner", "vet", "shelter", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type PetVerificationStatus = "unverified" | "verified";
export type LostReportStatus = "active" | "resolved";

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  city?: string;
  address?: string;
  location?: string;
  website?: string;
  socialLinks?: string;
  socialMediaLinks?: string;
  operatingHours?: string;
  registrationNumber?: string;
  imageUrl?: string;
  avatarUrl?: string;
  imageFileId?: string;
  avatarFileId?: string;
  createdAt?: Date | null;
  organization?: Record<string, unknown>;
}

export type PetOwnerInfo = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: UserRole;
  imageUrl?: string;
  imageFileId?: string;
};

export interface Pet {
  id: string;
  ownerId: string;
  owner?: PetOwnerInfo;
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  location?: string;
  weight?: number;
  color?: string;
  themeColor?: string;
  gender?: string;
  description?: string;
  imageUrl?: string;
  imageFileId?: string;
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

export interface PetDocument {
  id: string;
  petId: string;
  ownerId: string;
  name: string;
  issuedDate: string;
  fileId: string;
  mimeType?: string;
  createdAt?: string | null;
}

export type PublicPet = {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  color?: string;
  gender?: string;
  description?: string;
  imageUrl?: string;
  isLost: boolean;
  isAdoptable: boolean;
  verificationStatus?: PetVerificationStatus;
  publicQrId: string;
};

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface Clinic {
  _id: string;
  userId: string;

  name: string;
  website?: string;
  registrationNumber?: string;

  phoneNumbers: string[];
  location: string;

  workingHours: WorkingHours;

  socialMediaLinks: SocialMediaLink[];

  verified: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Shelter {
  _id: string;
  userId: string;

  name: string;

  website?: string;
  registrationNumber?: string;

  phoneNumbers: string[];

  location: string;

  workingHours: WorkingHours;

  socialMediaLinks: SocialMediaLink[];

  verified: boolean;

  createdAt: string;
  updatedAt: string;
}

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayWorkingHours {
  start: string | null;
  end: string | null;
}

export interface WorkingHours {
  monday?: DayWorkingHours | null;
  tuesday?: DayWorkingHours | null;
  wednesday?: DayWorkingHours | null;
  thursday?: DayWorkingHours | null;
  friday?: DayWorkingHours | null;
  saturday?: DayWorkingHours | null;
  sunday?: DayWorkingHours | null;
}