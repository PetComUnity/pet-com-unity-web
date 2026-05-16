import type { UserRole } from "@/types";

export const USER_ROLE_OPTIONS: UserRole[] = ["owner", "vet", "admin"];
export const VERIFICATION_ALLOWED_ROLES: UserRole[] = ["vet", "admin"];

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  vet: "Veterinarian",
  admin: "Administrator",
};
