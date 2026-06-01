"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Calendar,
  Edit3,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { ROLE_LABELS, VERIFICATION_ALLOWED_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import {
  profileUpdateFieldSchemas,
  type UpdateProfilePayload,
  type UpdateProfileValues,
} from "@/features/auth/auth.types";
import { useAuth } from "@/hooks/useAuth";
import { cn, formatDate } from "@/lib/utils";
import type { AppUser } from "@/types";

type DetailItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
};

type EditableProfileField = keyof UpdateProfileValues;

type EditableDetailItemProps = DetailItemProps & {
  field: EditableProfileField;
  editValue?: string;
  inputType?: "email" | "tel" | "text";
  isEditing: boolean;
  draftValue: string;
  error?: string;
  saving: boolean;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onEdit: (field: EditableProfileField, value: string) => void;
  onSave: (field: EditableProfileField) => void;
};

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

function getMemberSince(value: AppUser["createdAt"]) {
  if (!value) {
    return "Not available";
  }

  const date =
    value instanceof Date ? value : new Date(value as unknown as string);

  return Number.isNaN(date.getTime()) ? "Not available" : formatDate(date);
}

function getOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not added";
}

function getProfileValues(user: AppUser): UpdateProfileValues {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    city: user.city ?? "",
  };
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: DetailItemProps) {
  return (
    <div className="rounded-[14px] border border-[#e3d5c7] bg-[#fff8ef] p-4">
      <dt className="flex items-center gap-4 text-xs font-semibold tracking-[0.14em] text-[#7a695b] uppercase">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#ef9322]/15 text-[#ad6416]"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="min-w-0">{label}</span>
      </dt>
      <dd
        className={cn(
          "mt-2 pl-[60px] text-sm font-semibold break-words text-[#1a202c] sm:text-base",
          mono && "font-mono text-xs sm:text-sm",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function EditableDetailItem({
  icon: Icon,
  label,
  value,
  field,
  editValue,
  inputType = "text",
  isEditing,
  draftValue,
  error,
  saving,
  onCancel,
  onDraftChange,
  onEdit,
  onSave,
}: EditableDetailItemProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(field);
  }

  return (
    <div className="rounded-[14px] border border-[#e3d5c7] bg-[#fff8ef] p-4">
      <dt className="flex items-center gap-4 text-xs font-semibold tracking-[0.14em] text-[#7a695b] uppercase">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#ef9322]/15 text-[#ad6416]"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">{label}</span>

        {!isEditing ? (
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#1a202c]/15 bg-white text-[#1a202c] transition hover:-translate-y-0.5 hover:bg-[#97ff7b] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:outline-none"
            aria-label={`Edit ${label}`}
            title={`Edit ${label}`}
            onClick={() => onEdit(field, editValue ?? value)}
          >
            <Edit3 className="h-4 w-4" strokeWidth={2.4} />
          </button>
        ) : null}
      </dt>

      <dd className="mt-2 pl-[60px] text-sm font-semibold break-words text-[#1a202c] sm:text-base">
        {isEditing ? (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              type={inputType}
              value={draftValue}
              className="h-11 w-full rounded-[12px] border border-[#1a202c] bg-white px-3 text-sm font-semibold text-[#1a202c] transition outline-none placeholder:text-[#7a695b]/60 focus:ring-2 focus:ring-[#ef9322]/30 disabled:cursor-not-allowed disabled:bg-[#f3eee7]"
              aria-label={label}
              disabled={saving}
              autoFocus
              onChange={(event) => onDraftChange(event.target.value)}
            />

            {error ? (
              <p className="text-xs font-medium text-[#b91c1c]">{error}</p>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#1a202c] bg-[#97ff7b] text-[#1a202c] transition hover:-translate-y-0.5 hover:bg-[#8df86e] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Save ${label}`}
                title={`Save ${label}`}
                disabled={saving}
              >
                <Save className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#1a202c]/15 bg-white text-[#1a202c] transition hover:bg-[#fff3e4] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Cancel ${label} edit`}
                title={`Cancel ${label} edit`}
                disabled={saving}
                onClick={onCancel}
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function ProfileContent() {
  const { appUser, updateProfile } = useAuth();
  const [editingField, setEditingField] = useState<EditableProfileField | null>(
    null,
  );
  const [draftValue, setDraftValue] = useState("");
  const [savingField, setSavingField] = useState<EditableProfileField | null>(
    null,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<EditableProfileField, string>>
  >({});

  if (!appUser) {
    return null;
  }

  const profileValues = getProfileValues(appUser);
  const hasVerificationAccess = VERIFICATION_ALLOWED_ROLES.includes(
    appUser.role,
  );
  const quickActions: QuickAction[] = [
    {
      href: ROUTES.pets,
      label: "My Pets",
      description: "Saved profiles and QR records",
      icon: PawPrint,
    },
    {
      href: ROUTES.newPet,
      label: "Add Pet",
      description: "Create another pet profile",
      icon: Plus,
    },
  ];

  if (hasVerificationAccess) {
    quickActions.push({
      href: ROUTES.adminVerification,
      label: "Verification",
      description: "Pet profiles waiting for review",
      icon: ShieldCheck,
    });
  }

  function clearFieldError(field: EditableProfileField) {
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleEdit(field: EditableProfileField, value: string) {
    if (savingField) {
      return;
    }

    setEditingField(field);
    setDraftValue(value);
    clearFieldError(field);
  }

  function handleCancelEdit() {
    if (editingField) {
      clearFieldError(editingField);
    }

    setEditingField(null);
    setDraftValue("");
  }

  async function handleSave(field: EditableProfileField) {
    const parsedField = profileUpdateFieldSchemas[field].safeParse(draftValue);

    if (!parsedField.success) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [field]: parsedField.error.issues[0]?.message ?? "Enter a valid value.",
      }));
      return;
    }

    const currentValue = profileValues[field].trim();
    const nextValue = parsedField.data.trim();

    if (currentValue === nextValue) {
      handleCancelEdit();
      return;
    }

    setSavingField(field);
    clearFieldError(field);

    try {
      await updateProfile({ [field]: nextValue } as UpdateProfilePayload);
      setEditingField(null);
      setDraftValue("");
    } catch (error) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [field]:
          error instanceof Error
            ? error.message
            : "We could not update this detail right now.",
      }));
    } finally {
      setSavingField(null);
    }
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.16)] sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#97ff7b] text-[#1a202c]">
                <User className="h-5 w-5" strokeWidth={2.3} />
              </span>
              <div>
                <h2 className="font-display text-[1.75rem] leading-none font-bold text-[#1a202c]">
                  Account details
                </h2>
                <p className="mt-1 text-sm font-medium text-[#7a695b]">
                  Core identity and access information
                </p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <EditableDetailItem
                icon={User}
                label="Name"
                value={appUser.name}
                field="name"
                isEditing={editingField === "name"}
                draftValue={draftValue}
                error={fieldErrors.name}
                saving={savingField === "name"}
                onCancel={handleCancelEdit}
                onDraftChange={setDraftValue}
                onEdit={handleEdit}
                onSave={handleSave}
              />
              <DetailItem
                icon={ShieldCheck}
                label="Role"
                value={ROLE_LABELS[appUser.role]}
              />
              <DetailItem
                icon={Calendar}
                label="Member since"
                value={getMemberSince(appUser.createdAt)}
              />
              <DetailItem
                icon={User}
                label="Account ID"
                value={appUser.id}
                mono
              />
            </dl>
          </section>

          <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.16)] sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#ef9322]/20 text-[#ad6416]">
                <Mail className="h-5 w-5" strokeWidth={2.3} />
              </span>
              <div>
                <h2 className="font-display text-[1.75rem] leading-none font-bold text-[#1a202c]">
                  Contact
                </h2>
                <p className="mt-1 text-sm font-medium text-[#7a695b]">
                  Reachable account details
                </p>
              </div>
            </div>

            <dl className="grid gap-4">
              <EditableDetailItem
                icon={Mail}
                label="Email"
                value={appUser.email}
                field="email"
                inputType="email"
                isEditing={editingField === "email"}
                draftValue={draftValue}
                error={fieldErrors.email}
                saving={savingField === "email"}
                onCancel={handleCancelEdit}
                onDraftChange={setDraftValue}
                onEdit={handleEdit}
                onSave={handleSave}
              />
              <EditableDetailItem
                icon={Phone}
                label="Phone"
                value={getOptionalText(appUser.phone)}
                editValue={profileValues.phone}
                field="phone"
                inputType="tel"
                isEditing={editingField === "phone"}
                draftValue={draftValue}
                error={fieldErrors.phone}
                saving={savingField === "phone"}
                onCancel={handleCancelEdit}
                onDraftChange={setDraftValue}
                onEdit={handleEdit}
                onSave={handleSave}
              />
              <EditableDetailItem
                icon={MapPin}
                label="City"
                value={getOptionalText(appUser.city)}
                editValue={profileValues.city}
                field="city"
                isEditing={editingField === "city"}
                draftValue={draftValue}
                error={fieldErrors.city}
                saving={savingField === "city"}
                onCancel={handleCancelEdit}
                onDraftChange={setDraftValue}
                onEdit={handleEdit}
                onSave={handleSave}
              />
            </dl>
          </section>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-[1.75rem] leading-none font-bold text-[#1a202c]">
              Quick actions
            </h2>
            <p className="mt-1 text-sm font-medium text-[#7a695b]">
              Common places for this account
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex min-h-[126px] flex-col justify-between rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(26,32,44,0.16)] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb] focus-visible:outline-none"
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#97ff7b] text-[#1a202c] transition group-hover:bg-[#8df86e]">
                    <Icon className="h-5 w-5" strokeWidth={2.35} />
                  </span>
                  <span className="text-sm font-semibold text-[#7a695b]">
                    Open
                  </span>
                </span>
                <span>
                  <span className="font-display block text-[1.55rem] leading-none font-bold text-[#1a202c]">
                    {label}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-[#7a695b]">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
