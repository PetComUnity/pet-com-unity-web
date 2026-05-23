"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/constants/routes";
import { loginSchema, type LoginFormValues } from "@/features/auth/auth.types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleLogin(values: LoginFormValues) {
    setFormError(null);

    try {
      await login(values);
      router.replace(ROUTES.dashboard);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not sign you in right now.",
      );
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleLogin)}>
      <Input
        label="Email"
        type="email"
        placeholder="owner@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        placeholder="********"
        error={errors.password?.message}
        {...register("password")}
      />
      {formError ? (
        <p className="text-danger rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
          {formError}
        </p>
      ) : null}
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Log in"}
      </Button>
    </form>
  );
}
