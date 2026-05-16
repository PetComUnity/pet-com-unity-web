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
import { onAuthStateChanged, type User } from "firebase/auth";
import type { AppUser } from "@/types";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "@/features/auth/auth.service";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/auth.types";

type AuthContextValue = {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  register: (values: RegisterFormValues) => Promise<void>;
  login: (values: LoginFormValues) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setAppUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(nextUser.uid);
        setAppUser(profile);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = useCallback(async (values: RegisterFormValues) => {
    const nextUser = await registerUser(values);
    const profile = await getUserProfile(nextUser.uid);
    setUser(nextUser);
    setAppUser(profile);
  }, []);

  const login = useCallback(async (values: LoginFormValues) => {
    const credential = await loginUser(values);
    const profile = await getUserProfile(credential.user.uid);
    setUser(credential.user);
    setAppUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setAppUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      appUser,
      loading,
      register,
      login,
      logout,
    }),
    [appUser, loading, login, logout, register, user],
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
