"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ROUTES } from "@/constants/routes";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/auth.types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "owner",
    },
  });

  async function handleRegister(values: RegisterFormValues) {
    setFormError(null);

    try {
      await registerAccount(values);
      router.replace(ROUTES.dashboard);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not create your account right now.",
      );
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(handleRegister)}>
      <Input
        label="Full name"
        placeholder="Ana Petreska"
        error={errors.name?.message}
        {...register("name")}
      />
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
        placeholder="At least 6 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <Select label="Role" error={errors.role?.message} {...register("role")}>
        <option value="owner">Owner</option>
        <option value="vet">Veterinarian</option>
        <option value="shelter">Shelter</option>
      </Select>
      {formError ? (
        <p className="text-danger rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
          {formError}
        </p>
      ) : null}
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
