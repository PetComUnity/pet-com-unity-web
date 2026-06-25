import type { AppUser } from "@/types";
import { apiRequest } from "@/lib/api";
import type {
  ChangePasswordPayload,
  LoginFormValues,
  RegisterFormValues,
  UpdateProfilePayload,
} from "@/features/auth/auth.types";

const TOKEN_KEY = "auth_token";
const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type UploadProfileImageResult =
  | { type: "public"; url: string }
  | { type: "private"; fileId: string };

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type AuthResponse = {
  user: AppUser;
  token: string;
  organization: {
    name?: string;
    email?: string;
    phoneNumbers?: string[];
    location?: string;
    website?: string;
    registrationNumber?: string;
    socialMediaLinks?: {
      platform?: string;
      url?: string;
    }[];
    workingHours?: unknown;
  };
};

type UpdateProfileResponse = AppUser | { user: AppUser };

function hasWrappedUser(
  response: UpdateProfileResponse,
): response is { user: AppUser } {
  return (
    typeof response === "object" &&
    response !== null &&
    "user" in response &&
    typeof response.user === "object" &&
    response.user !== null
  );
}

export async function registerUser(
  values: RegisterFormValues,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: values,
  });
}

export async function loginUser(
  values: LoginFormValues,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: values,
  });
}

export async function logoutUser(): Promise<void> {
  const token = getToken();
  await apiRequest("/auth/logout", {
    method: "POST",
    token: token ?? undefined,
  });
  removeToken();
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const token = getToken();
  return apiRequest<AuthResponse>("/auth/me", {
    token: token ?? undefined,
  });
}

export async function updateCurrentUserProfile(
  values: UpdateProfilePayload,
): Promise<AppUser> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to update your profile.");
  }

  const response = await apiRequest<UpdateProfileResponse>("/me", {
    method: "PUT",
    body: values,
    token,
  });

  return hasWrappedUser(response) ? response.user : response;
}

export async function changeCurrentUserPassword(
  values: ChangePasswordPayload,
): Promise<void> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to change your password.");
  }

  await apiRequest<void>("/me/password", {
    method: "PUT",
    body: values,
    token,
  });
}

export async function uploadCurrentUserProfileImage(
  file: File,
): Promise<UploadProfileImageResult> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to upload a profile image.");
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", "avatar");

  const response = await fetch(`${getApiBaseUrl()}/upload/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<{
    fileId?: string;
    url?: string;
  }>;

  if (!response.ok) {
    throw new Error(payload.message ?? "We could not upload this image.");
  }

  if (payload.data?.fileId) {
    return { type: "private", fileId: payload.data.fileId };
  }

  if (payload.data?.url) {
    return { type: "public", url: payload.data.url };
  }

  throw new Error("Upload succeeded but no image reference was returned.");
}

export async function updateVetClinicProfile(
  values: Record<string, unknown>,
): Promise<unknown> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to update your clinic profile.");
  }

  return apiRequest<unknown>("/clinics", {
    method: "PATCH",
    body: values,
    token,
  });
}

export async function updateShelterProfileData(
  values: Record<string, unknown>,
): Promise<unknown> {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in to update your shelter profile.");
  }

  return apiRequest<unknown>("/shelters", {
    method: "PATCH",
    body: values,
    token,
  });
}
