import type { AppUser } from "@/types";

export type MongooseSocialLink = {
  platform: string;
  url: string;
};

export type DayWorkingHours = {
  start: string | null;
  end: string | null;
};

export type MongooseWorkingHours = {
  monday: DayWorkingHours;
  tuesday: DayWorkingHours;
  wednesday: DayWorkingHours;
  thursday: DayWorkingHours;
  friday: DayWorkingHours;
  saturday: DayWorkingHours;
  sunday: DayWorkingHours;
};

// Both Vet (Clinic) and Shelter have this exact schema layout
export type MongoOrganization = {
  _id: string;
  userId: string;
  name: string;
  email: string | null;
  phoneNumbers: string[];
  website: string | null;
  registrationNumber: string | null;
  location: string | null;
  workingHours: MongooseWorkingHours;
  socialMediaLinks: MongooseSocialLink[];
  verified: boolean;
};