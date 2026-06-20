"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/auth.types";
import { useAuth } from "@/hooks/useAuth";

const inputClass =
  "h-11 w-full appearance-none rounded-[1rem] border border-[var(--input-border)] bg-white px-4 font-sans text-sm font-medium leading-5 text-[var(--primary-text)] outline-none transition placeholder:text-[#7A7878]/50 hover:border-[#7A7878] focus:border-[var(--input-border)] focus:ring-2 focus:ring-[var(--input-border)]/10";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    formState: { errors, isSubmitting, isDirty, isValid },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
    mode: "onChange",
  });

  async function handleRegister(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerAccount(values);
      router.replace(ROUTES.pets);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not create your account right now.",
      );
    }
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(handleRegister)}>
      <div className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          className={inputClass}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className={`${inputClass} pr-11`}
            {...register("password")}
          />
          <button
            type="button"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[#7A7878]/50 transition hover:text-[#010101]"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}

        <input
          placeholder="Enter your name"
          className={inputClass}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}

        <div className="relative">
          <select
            className={`${inputClass} pr-10`}
            defaultValue=""
            style={{ color: "rgba(122,120,120,0.5)" }}
            {...register("role", {
              onChange: (e) => {
                e.currentTarget.style.color = "#010101";
              },
            })}
          >
            <option value="" disabled>
              Choose your role
            </option>
            <option value="owner">Owner</option>
            <option value="vet">Vet</option>
            <option value="shelter">Shelter</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#7A7878]/50" />
        </div>
        {errors.role && (
          <p className="text-xs text-red-500">{errors.role.message}</p>
        )}

        {formError && <p className="text-xs text-red-500">{formError}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isDirty || !isValid}
        className="font-display mt-6 inline-flex h-14 w-full items-center justify-center rounded-[1rem] border border-[var(--input-border)] bg-[#8df86e] text-2xl font-bold text-[var(--primary-text)] transition hover:bg-[#6bb556] focus-visible:ring-2 focus-visible:ring-[var(--input-border)]/20 focus-visible:outline-none disabled:bg-[#7A7878]/50 disabled:text-white"
      >
        {isSubmitting ? "Creating account..." : "Create an account"}
      </button>
    </form>
  );
}