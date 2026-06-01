import type { AppUser } from "@/types";
import { apiRequest } from "@/lib/api";
import type {
  LoginFormValues,
  RegisterFormValues,
  UpdateProfilePayload,
} from "@/features/auth/auth.types";

const TOKEN_KEY = "auth_token";

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

export async function getCurrentUser(): Promise<AppUser> {
  const token = getToken();
  return apiRequest<AppUser>("/auth/me", {
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
