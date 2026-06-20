export interface AddStaffForm {
  name: string;

  available: boolean;

  dateOfBirth: string;

  phoneNumber: string;

  email: string;

  university: string | null;

  educationDegree: string;

  governmentIdScan: File | null;

  graduationYear: string | null;

  veterinaryLicenseNumber: string;

  licenseIssuingAuthority: string;

  validFrom: string;

  licenseScan: File | null;

  positions: string[];

  workingDays: string[];

  workingHours: string;

  emergencyAvailability: boolean;

  avatar: File | null;
}