"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { RegisterForm } from "@/components/auth/RegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function RegisterPage() {
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
        <Spinner label="Preparing registration..." />
      </div>
    );
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Start as a pet owner and grow from this scaffold into the full AnimalID platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RegisterForm />
          <p className="text-sm text-muted">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-medium text-brand">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
