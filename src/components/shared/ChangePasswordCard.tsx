"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { passwordChangeSchema, type ChangePasswordValues } from "@/features/auth/auth.types";
import { changeCurrentUserPassword } from "@/features/auth/auth.service";

// Define the type locally so it doesn't try to look inside auth.types
type PasswordField = keyof ChangePasswordValues;

const emptyPasswordValues: ChangePasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordCard() {
  const [passwordValues, setPasswordValues] = useState<ChangePasswordValues>(emptyPasswordValues);
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<PasswordField, string>>>({});
  const [visiblePasswordFields, setVisiblePasswordFields] = useState<Partial<Record<PasswordField, boolean>>>({});
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  function handlePasswordChange(field: PasswordField, value: string) {
    setPasswordValues((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setPasswordFormError(null);
    setPasswordSuccess(null);
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedValues = passwordChangeSchema.safeParse(passwordValues);

    if (!parsedValues.success) {
      const nextErrors: Partial<Record<PasswordField, string>> = {};
      parsedValues.error.issues.forEach((issue) => {
        const field = issue.path[0] as PasswordField;
        if (!nextErrors[field]) nextErrors[field] = issue.message;
      });
      setPasswordErrors(nextErrors);
      return;
    }

    setSubmittingPassword(true);
    try {
      await changeCurrentUserPassword({
        currentPassword: parsedValues.data.currentPassword,
        newPassword: parsedValues.data.newPassword,
      });
      setPasswordValues(emptyPasswordValues);
      setVisiblePasswordFields({});
      setPasswordSuccess("Password updated successfully.");
    } catch (error) {
      setPasswordFormError(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setSubmittingPassword(false);
    }
  }

  return (
    <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="mb-5 text-center lg:text-left">
        <h2 className="text-[1.05rem] font-semibold text-[#1a202c]">Change password</h2>
        <p className="mt-1 text-sm font-medium text-[#7a7878]">Update your sign-in password</p>
      </div>

      <form className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr_170px]" onSubmit={handlePasswordSubmit}>
        {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
          <div key={field} className="min-w-0">
            <span className="relative block">
              <input
                type={visiblePasswordFields[field] ? "text" : "password"}
                value={passwordValues[field]}
                placeholder={field.replace(/([A-Z])/g, " $1")}
                disabled={submittingPassword}
                className="block h-11 w-full rounded-[14px] border border-[#c8c8c8] bg-white px-4 pr-12 text-[0.95rem] font-medium transition outline-none focus:border-[#1a202c] disabled:bg-[#f5f5f5]"
                onChange={(e) => handlePasswordChange(field, e.target.value)}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#111827]"
                onClick={() => setVisiblePasswordFields(prev => ({ ...prev, [field]: !prev[field] }))}
              >
                {visiblePasswordFields[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
            {passwordErrors[field] && <p className="mt-1 px-4 text-xs text-[#b91c1c]">{passwordErrors[field]}</p>}
          </div>
        ))}

        <button
          type="submit"
          disabled={submittingPassword}
          className="h-11 rounded-[14px] bg-[#8df86e] border border-[#5fb953] text-[0.95rem] font-medium text-[#010101] hover:bg-[#7eea60] disabled:opacity-60"
        >
          {submittingPassword ? "Updating..." : "Update"}
        </button>

        {passwordFormError && <p className="text-sm font-medium text-[#b91c1c] lg:col-span-4">{passwordFormError}</p>}
        {passwordSuccess && <p className="text-sm font-semibold text-[#166534] lg:col-span-4">{passwordSuccess}</p>}
      </form>
    </section>
  );
}