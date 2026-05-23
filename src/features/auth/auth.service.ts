import type { AppUser } from "@/types";
import { apiRequest } from "@/lib/api";
import type {
  LoginFormValues,
  RegisterFormValues,
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
