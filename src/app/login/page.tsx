"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(ROUTES.dashboard);
    }
  }, [router, user]);

  if (loading || user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4">
        <Spinner label="Preparing your session..." />
      </div>
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Sign in to manage your pets, generate QR pages, and update lost status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm />
          <p className="text-sm text-muted">
            New here?{" "}
            <Link href={ROUTES.register} className="font-medium text-brand">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
