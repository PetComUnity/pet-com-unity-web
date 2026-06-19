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

  register: (
    values: RegisterFormValues,
  ) => Promise<AppUser>;

  login: (
    values: LoginFormValues,
  ) => Promise<AppUser>;

  logout: () => Promise<void>;

  updateProfile: (
    values: UpdateProfilePayload,
  ) => Promise<AppUser>;

  getCurrentUser: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AppUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  /**
   * =========================
   * REFRESH USER
   * =========================
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();

      /**
       * Backend:
       * {
       *   user: {...},
       *   organization: {...}
       * }
       */
      if (
        response &&
        typeof response === "object" &&
        "user" in response
      ) {
        const {
          user: userData,
          organization,
        } = response as any;

        const mergedUser = {
          ...userData,
          ...(organization
            ? { organization }
            : {}),
        } as AppUser;

        setUser(mergedUser);
        return;
      }

      setUser(response as any);
    } catch (error) {
      console.error(
        "refreshUser failed",
        error,
      );

      setUser(null);
    }
  }, []);

  /**
   * =========================
   * INIT SESSION
   * =========================
   */
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

  /**
   * =========================
   * REGISTER
   * =========================
   */
  const register = useCallback(
    async (
      values: RegisterFormValues,
    ): Promise<AppUser> => {
      const {
        user: newUser,
        token,
      } = await registerUser(values);

      setToken(token);

      setUser(newUser);

      return newUser;
    },
    [],
  );

  /**
   * =========================
   * LOGIN
   * =========================
   */
  const login = useCallback(
    async (
      values: LoginFormValues,
    ): Promise<AppUser> => {
      const {
        user: newUser,
        token,
      } = await loginUser(values);

      setToken(token);

      /**
       * immediate state
       */
      setUser(newUser);

      /**
       * fetch full profile
       * including organization
       */
      await refreshUser();

      return newUser;
    },
    [refreshUser],
  );

  /**
   * =========================
   * LOGOUT
   * =========================
   */
  const logout = useCallback(async () => {
    await logoutUser();

    setUser(null);
  }, []);

  /**
   * =========================
   * UPDATE PROFILE
   * =========================
   */
  const updateProfile = useCallback(
    async (
      values: UpdateProfilePayload,
    ): Promise<AppUser> => {
      const updatedUser =
        await updateCurrentUserProfile(
          values,
        );

      setUser(updatedUser);

      return updatedUser;
    },
    [],
  );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        appUser: user,
        loading,

        register,
        login,
        logout,

        updateProfile,

        getCurrentUser:
          refreshUser,
      }),
      [
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        refreshUser,
      ],
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider.",
    );
  }

  return context;
}