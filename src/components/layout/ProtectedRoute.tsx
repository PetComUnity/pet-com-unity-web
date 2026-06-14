"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { appUser, loading } = useAuth();

  const isUnauthorized =
    !!allowedRoles && !!appUser && !allowedRoles.includes(appUser.role);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!appUser) {
      router.replace(ROUTES.login);
      return;
    }

    if (isUnauthorized) {
      if (appUser.role === "vet") {
  
  router.replace(ROUTES.clinic);
} else {
  
  router.replace(ROUTES.pets);
}
      
      router.replace(ROUTES.pets);
    }
  }, [isUnauthorized, loading, router, appUser]);

  if (loading || !appUser || (allowedRoles && !appUser) || isUnauthorized) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-6xl items-center justify-center px-4">
        <Spinner label="Checking access..." />
      </div>
    );
  }

  return <>{children}</>;
}
