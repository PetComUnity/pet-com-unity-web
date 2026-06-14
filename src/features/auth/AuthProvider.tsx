"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppUser } from "@/types";
import {
  getCurrentUser,
  getToken,
  loginUser,
  logoutUser,
  registerUser,
  setToken,
  updateCurrentUserProfile,
} from "@/features/auth/auth.service";
import type {
  LoginFormValues,
  RegisterFormValues,
  UpdateProfilePayload,
} from "@/features/auth/auth.types";

type AuthContextValue = {
  appUser: AppUser | null;
  loading: boolean;
  register: (values: RegisterFormValues) => Promise<void>;
  login: (values: LoginFormValues) => Promise<void>;
  logout: () => void; // Changed to void as logoutUser usually handles the API
  updateProfile: (values: UpdateProfilePayload) => Promise<AppUser>;
  getCurrentUser: () => Promise<void>; // Added this
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      
      // Check if the response comes as { user: ..., organization: ... }
      if (response && typeof response === 'object' && 'user' in response && 'organization' in response) {
        const { user: userData, organization } = response as any;
        
        // Merge them into one object that matches your AppUser interface
        const mergedUser = {
          ...userData,
          organization: organization,
        } as AppUser;
        
        setUser(mergedUser);
      } else {
        // If it's already just an AppUser, set it directly
        setUser(response as AppUser);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      await refreshUser();
      setLoading(false);
    }
    void initAuth();
  }, [refreshUser]);

  const register = useCallback(async (values: RegisterFormValues) => {
    const { user: newUser, token } = await registerUser(values);
    setToken(token);
    setUser(newUser);
  }, []);

  const login = useCallback(async (values: LoginFormValues) => {
    const { user: newUser, token } = await loginUser(values);
    setToken(token);
    setUser(newUser);
    await refreshUser(); // Fetch the full profile (including organization) after login
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (values: UpdateProfilePayload) => {
    const updatedUser = await updateCurrentUserProfile(values);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ 
      appUser: user, 
      loading, 
      register, 
      login, 
      logout, 
      updateProfile, 
      getCurrentUser: refreshUser // Expose the refresh function
    }),
    [user, loading, register, login, logout, updateProfile, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider.");
  }
  return context;
}