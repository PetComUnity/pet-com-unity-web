"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  PawPrint,
  Plus,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { VERIFICATION_ALLOWED_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { PrivateImage } from "@/components/common/PrivateImage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AddPetModal } from "@/components/pet/AddPetModal";
import {
  passwordChangeSchema,
  profileUpdateFieldSchemas,
  type ChangePasswordValues,
  type UpdateProfilePayload,
  type UpdateProfileValues,
} from "@/features/auth/auth.types";
import {
  changeCurrentUserPassword,
  uploadCurrentUserProfileImage,
} from "@/features/auth/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { AppUser, UserRole } from "@/types";

type EditableProfileField = keyof UpdateProfileValues;
type PasswordField = keyof ChangePasswordValues;

type ProfileFieldDefinition = {
  field: EditableProfileField;
  placeholder: string;
  inputType?: "email" | "tel" | "text" | "url";
  className?: string;
};

type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
} & (
  | {
      href: string;
      action?: never;
    }
  | {
      action: "add-pet";
      href?: never;
    }
);

const emptyPasswordValues: ChangePasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const profileRoleLabels: Record<UserRole, string> = {
  owner: "Owner",
  vet: "Veterinary",
  shelter: "Shelter",
  admin: "Admin",
};

const ownerProfileFields = [
  {
    field: "name",
    placeholder: "Full name",
    className: "lg:col-start-1 lg:row-start-1",
  },
  {
    field: "email",
    placeholder: "email",
    inputType: "email",
    className: "lg:col-start-2 lg:row-start-1",
  },
  {
    field: "phone",
    placeholder: "contact number",
    inputType: "tel",
    className: "lg:col-start-1 lg:row-start-2",
  },
  {
    field: "city",
    placeholder: "Address",
    className: "lg:col-start-2 lg:row-start-2",
  },
] satisfies readonly ProfileFieldDefinition[];

const organizationProfileFields = [
  {
    field: "name",
    placeholder: "Organization name",
    className: "lg:col-start-1 lg:row-start-1",
  },
  {
    field: "phone",
    placeholder: "contact number",
    inputType: "tel",
    className: "lg:col-start-2 lg:row-start-1",
  },
  {
    field: "socialLinks",
    placeholder: "Social media links",
    className: "lg:col-start-3 lg:row-start-1",
  },
  {
    field: "website",
    placeholder: "website",
    inputType: "url",
    className: "lg:col-start-1 lg:row-start-2",
  },
  {
    field: "email",
    placeholder: "email",
    inputType: "email",
    className: "lg:col-start-2 lg:row-start-2",
  },
  {
    field: "operatingHours",
    placeholder: "Operating hours",
    className: "lg:col-start-3 lg:row-start-2",
  },
  {
    field: "registrationNumber",
    placeholder: "Registration number",
    className: "lg:col-start-1 lg:row-start-3",
  },
  {
    field: "city",
    placeholder: "Address",
    className: "lg:col-start-2 lg:row-start-3",
  },
] satisfies readonly ProfileFieldDefinition[];

function normalizeText(value?: string | null) {
  return value?.trim() ?? "";
}

function isOrganizationRole(role: UserRole) {
  return role === "vet" || role === "shelter";
}

function getProfileFieldDefinitions(role: UserRole) {
  return isOrganizationRole(role)
    ? organizationProfileFields
    : ownerProfileFields;
}

function getProfileFieldDefinition(
  definitions: readonly ProfileFieldDefinition[],
  field: EditableProfileField,
) {
  const definition = definitions.find((item) => item.field === field);

  if (!definition) {
    throw new Error(`Missing profile field definition for ${field}.`);
  }

  return definition;
}

function getProfileValues(user: AppUser): UpdateProfileValues {
  return {
    name: normalizeText(user.name),
    email: normalizeText(user.email),
    phone: normalizeText(user.phone),
    city: normalizeText(user.address ?? user.city ?? user.location),
    website: normalizeText(user.website),
    socialLinks: normalizeText(user.socialLinks ?? user.socialMediaLinks),
    operatingHours: normalizeText(user.operatingHours),
    registrationNumber: normalizeText(user.registrationNumber),
  };
}

function getProfileImageFileId(user: AppUser) {
  return normalizeText(user.imageFileId ?? user.avatarFileId);
}

function getProfileImageUrl(user: AppUser) {
  return normalizeText(user.imageUrl ?? user.avatarUrl);
}

type EditableProfilePillProps = ProfileFieldDefinition & {
  disabled: boolean;
  draftValue: string;
  error?: string;
  isEditing: boolean;
  saving: boolean;
  value: string;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onEdit: (field: EditableProfileField, value: string) => void;
  onSave: (field: EditableProfileField) => void;
};

function EditableProfilePill({
  field,
  placeholder,
  inputType = "text",
  className,
  disabled,
  draftValue,
  error,
  isEditing,
  saving,
  value,
  onCancel,
  onDraftChange,
  onEdit,
  onSave,
}: EditableProfilePillProps) {
  const inputId = `profile-${field}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(field);
  }

  return (
    <div className={cn("min-w-0", className)}>
      <form className="relative" onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          {placeholder}
        </label>
        <input
          id={inputId}
          type={inputType}
          value={isEditing ? draftValue : value}
          placeholder={placeholder}
          readOnly={!isEditing}
          disabled={saving}
          className={cn(
            "block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]",
            isEditing ? "pr-20" : "pr-12",
          )}
          autoFocus={isEditing}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && isEditing) {
              event.preventDefault();
              onCancel();
            }
          }}
        />

        {isEditing ? (
          <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            <button
              type="submit"
              aria-label={`Save ${placeholder}`}
              title={`Save ${placeholder}`}
              disabled={saving}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[#1a202c] transition hover:bg-[#97ff7b]/75 focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2.6} />
            </button>
            <button
              type="button"
              aria-label={`Cancel ${placeholder} edit`}
              title={`Cancel ${placeholder} edit`}
              disabled={saving}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[#1a202c] transition hover:bg-[#fff3e4] focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onCancel}
            >
              <X className="h-4 w-4" strokeWidth={2.6} />
            </button>
          </span>
        ) : (
          <button
            type="button"
            aria-label={`Edit ${placeholder}`}
            title={`Edit ${placeholder}`}
            disabled={disabled}
            className="absolute top-1/2 right-3 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[10px] text-[#111827] transition hover:bg-[#fff3e4] focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => onEdit(field, value)}
          >
            <Edit3 className="h-4 w-4" strokeWidth={2.35} />
          </button>
        )}
      </form>

      {error ? (
        <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{error}</p>
      ) : null}
    </div>
  );
}

type ProfileAvatarPanelProps = {
  error: string | null;
  previewUrl: string | null;
  uploading: boolean;
  user: AppUser;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function ProfileAvatarPanel({
  error,
  previewUrl,
  uploading,
  user,
  onFileChange,
}: ProfileAvatarPanelProps) {
  const [inputKey, setInputKey] = useState(0);
  const fileId = getProfileImageFileId(user);
  const imageUrl = previewUrl ?? getProfileImageUrl(user);
  const isLogo = isOrganizationRole(user.role);
  const imageAlt = isLogo ? "Organization logo" : "Profile avatar";

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event);
    setInputKey((currentKey) => currentKey + 1);
  }

  return (
    <div className="flex h-full flex-col items-center gap-3 md:max-lg:items-start lg:items-start lg:justify-between">
      <label className="group relative block h-[100px] w-[100px] cursor-pointer overflow-hidden rounded-[18px] border border-[#c8c8c8] bg-white focus-within:ring-2 focus-within:ring-[#1a202c]/20 md:max-lg:h-20">
        <span className="sr-only">
          {isLogo ? "Upload organization logo" : "Upload profile avatar"}
        </span>
        <Image
          src="/images/placeholder-owner-avatar.png"
          alt=""
          fill
          priority
          sizes="100px"
          className="object-cover"
        />

        {fileId && !previewUrl ? (
          <PrivateImage
            fileId={fileId}
            alt={imageAlt}
            fallbackSrc="/images/placeholder-owner-avatar.png"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <Edit3 className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <input
          key={inputKey}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={handleInputChange}
        />
      </label>

      <label className="inline-flex min-h-5 w-[100px] cursor-pointer items-center justify-center rounded-full bg-[#ff8a24] px-3 text-center text-[10px] font-semibold text-white transition focus-within:ring-2 focus-within:ring-[#1a202c]/25 focus-within:ring-offset-2 focus-within:outline-none hover:bg-[#e87918]">
        {uploading ? "Uploading..." : isLogo ? "+ Logo" : "+ Avatar"}
        <input
          key={`button-${inputKey}`}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={handleInputChange}
        />
      </label>

      {error ? (
        <p className="max-w-[132px] text-center text-xs font-medium text-[#b91c1c] lg:text-left">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TabletProfileInfoCard({
  avatarError,
  avatarPreviewUrl,
  disabled,
  draftValue,
  editingField,
  fieldErrors,
  profileValues,
  savingField,
  uploadingAvatar,
  user,
  onAvatarChange,
  onCancelEdit,
  onDraftChange,
  onEdit,
  onSave,
}: ProfileInfoCardProps) {
  const isOrganization = isOrganizationRole(user.role);
  const fields = getProfileFieldDefinitions(user.role);

  function renderField(field: EditableProfileField, className?: string) {
    const fieldConfig = getProfileFieldDefinition(fields, field);

    return (
      <EditableProfilePill
        key={field}
        {...fieldConfig}
        className={className}
        disabled={disabled}
        value={profileValues[field]}
        isEditing={editingField === field}
        draftValue={draftValue}
        error={fieldErrors[field]}
        saving={savingField === field}
        onCancel={onCancelEdit}
        onDraftChange={onDraftChange}
        onEdit={onEdit}
        onSave={onSave}
      />
    );
  }

  const rolePill = (
    <div className="min-w-0">
      <div className="flex h-11 w-full items-center justify-center rounded-[14px] border border-[#5fb953] bg-[#8df86e] px-5 text-center text-[1rem] font-medium text-[#010101]">
        {profileRoleLabels[user.role]}
      </div>
    </div>
  );

  return (
    <section className="rounded-[18px] border border-[#1a202c] bg-white p-6 shadow-[0_4px_4px_rgba(0,0,0,0.22)]">
      {isOrganization ? (
        <div className="space-y-6">
          <div className="grid grid-cols-[100px_minmax(0,260px)_minmax(0,260px)] gap-x-[27px] gap-y-6">
            <div className="col-start-1 row-span-2 row-start-1">
              <ProfileAvatarPanel
                error={avatarError}
                previewUrl={avatarPreviewUrl}
                uploading={uploadingAvatar}
                user={user}
                onFileChange={onAvatarChange}
              />
            </div>
            {renderField("name", "col-start-2 row-start-1")}
            {renderField("phone", "col-start-3 row-start-1")}
            {renderField("registrationNumber", "col-start-2 row-start-2")}
            {renderField("email", "col-start-3 row-start-2")}
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            {renderField("website")}
            {renderField("socialLinks")}
          </div>

          <div className="grid grid-cols-[minmax(0,392px)_minmax(0,268px)] gap-x-3">
            {renderField("city")}
            {rolePill}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-[100px_minmax(0,260px)_minmax(0,260px)] gap-x-[27px] gap-y-6">
            <div className="col-start-1 row-span-2 row-start-1">
              <ProfileAvatarPanel
                error={avatarError}
                previewUrl={avatarPreviewUrl}
                uploading={uploadingAvatar}
                user={user}
                onFileChange={onAvatarChange}
              />
            </div>
            {renderField("name", "col-start-2 row-start-1")}
            {renderField("email", "col-start-2 row-start-2")}
            {renderField("phone", "col-start-3 row-start-2")}
          </div>

          <div className="grid grid-cols-[minmax(0,392px)_minmax(0,268px)] gap-x-3">
            {renderField("city")}
            {rolePill}
          </div>
        </div>
      )}
    </section>
  );
}

type ProfileInfoCardProps = {
  avatarError: string | null;
  avatarPreviewUrl: string | null;
  disabled: boolean;
  draftValue: string;
  editingField: EditableProfileField | null;
  fieldErrors: Partial<Record<EditableProfileField, string>>;
  profileValues: UpdateProfileValues;
  savingField: EditableProfileField | null;
  uploadingAvatar: boolean;
  user: AppUser;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCancelEdit: () => void;
  onDraftChange: (value: string) => void;
  onEdit: (field: EditableProfileField, value: string) => void;
  onSave: (field: EditableProfileField) => void;
};

function ProfileInfoCard({
  avatarError,
  avatarPreviewUrl,
  disabled,
  draftValue,
  editingField,
  fieldErrors,
  profileValues,
  savingField,
  uploadingAvatar,
  user,
  onAvatarChange,
  onCancelEdit,
  onDraftChange,
  onEdit,
  onSave,
}: ProfileInfoCardProps) {
  const fields = getProfileFieldDefinitions(user.role);
  const roleClassName = isOrganizationRole(user.role)
    ? "lg:col-start-3 lg:row-start-3"
    : "lg:col-start-3 lg:row-start-2";

  return (
    <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[112px_minmax(0,1fr)] lg:gap-12">
        <ProfileAvatarPanel
          error={avatarError}
          previewUrl={avatarPreviewUrl}
          uploading={uploadingAvatar}
          user={user}
          onFileChange={onAvatarChange}
        />

        <div className="grid min-w-0 gap-6 lg:auto-rows-min lg:grid-cols-[minmax(220px,268px)_minmax(260px,1fr)_minmax(220px,268px)] lg:gap-x-[60px]">
          {fields.map((fieldConfig) => (
            <EditableProfilePill
              key={fieldConfig.field}
              {...fieldConfig}
              disabled={disabled}
              value={profileValues[fieldConfig.field]}
              isEditing={editingField === fieldConfig.field}
              draftValue={draftValue}
              error={fieldErrors[fieldConfig.field]}
              saving={savingField === fieldConfig.field}
              onCancel={onCancelEdit}
              onDraftChange={onDraftChange}
              onEdit={onEdit}
              onSave={onSave}
            />
          ))}

          <div className={cn("min-w-0", roleClassName)}>
            <div className="flex h-11 w-full items-center justify-center rounded-[14px] border border-[#5fb953] bg-[#8df86e] px-5 text-center text-[0.95rem] font-medium text-[#010101] sm:text-[1rem]">
              {profileRoleLabels[user.role]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type PasswordInputProps = {
  autoComplete: string;
  disabled: boolean;
  error?: string;
  field: PasswordField;
  placeholder: string;
  value: string;
  visible: boolean;
  onChange: (field: PasswordField, value: string) => void;
  onToggleVisibility: (field: PasswordField) => void;
};

function PasswordPillInput({
  autoComplete,
  disabled,
  error,
  field,
  placeholder,
  value,
  visible,
  onChange,
  onToggleVisibility,
}: PasswordInputProps) {
  const inputId = `profile-${field}`;

  return (
    <div className="min-w-0">
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>
      <span className="relative block">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 pr-12 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
          onChange={(event) => onChange(field, event.target.value)}
        />
        <button
          type="button"
          aria-label={visible ? `Hide ${placeholder}` : `Show ${placeholder}`}
          title={visible ? `Hide ${placeholder}` : `Show ${placeholder}`}
          disabled={disabled}
          className="absolute top-1/2 right-3 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[10px] text-[#111827] transition hover:bg-[#fff3e4] focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onToggleVisibility(field)}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={2.35} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={2.35} />
          )}
        </button>
      </span>
      {error ? (
        <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{error}</p>
      ) : null}
    </div>
  );
}

function ChangePasswordCard() {
  const [passwordValues, setPasswordValues] =
    useState<ChangePasswordValues>(emptyPasswordValues);
  const [passwordErrors, setPasswordErrors] = useState<
    Partial<Record<PasswordField, string>>
  >({});
  const [visiblePasswordFields, setVisiblePasswordFields] = useState<
    Partial<Record<PasswordField, boolean>>
  >({});
  const [submittingPassword, setSubmittingPassword] = useState(false);

  function clearPasswordError(field: PasswordField) {
    setPasswordErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handlePasswordChange(field: PasswordField, value: string) {
    setPasswordValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    clearPasswordError(field);
  }

  function togglePasswordVisibility(field: PasswordField) {
    setVisiblePasswordFields((currentFields) => ({
      ...currentFields,
      [field]: !currentFields[field],
    }));
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = passwordChangeSchema.safeParse(passwordValues);

    if (!parsedValues.success) {
      const nextErrors: Partial<Record<PasswordField, string>> = {};

      parsedValues.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          typeof field === "string" &&
          field in passwordValues &&
          !nextErrors[field as PasswordField]
        ) {
          nextErrors[field as PasswordField] = issue.message;
        }
      });

      setPasswordErrors(nextErrors);
      return;
    }

    setSubmittingPassword(true);
    setPasswordErrors({});

    try {
      await changeCurrentUserPassword({
        currentPassword: parsedValues.data.currentPassword,
        newPassword: parsedValues.data.newPassword,
      });
      setPasswordValues(emptyPasswordValues);
      setVisiblePasswordFields({});
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not update your password right now.",
      );
    } finally {
      setSubmittingPassword(false);
    }
  }

  return (
    <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="mb-5 text-center lg:text-left">
        <h2 className="text-[1.05rem] leading-tight font-semibold text-[#1a202c]">
          Change password
        </h2>
        <p className="mt-1 text-sm font-medium text-[#7a7878]">
          Update your sign-in password
        </p>
      </div>

      <form
        className="grid min-w-0 gap-6 lg:auto-rows-min lg:grid-cols-[minmax(130px,1fr)_minmax(130px,1fr)_minmax(145px,1fr)_170px] lg:gap-x-3 xl:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_minmax(170px,1fr)_190px] xl:gap-x-6"
        onSubmit={handlePasswordSubmit}
      >
        <PasswordPillInput
          field="currentPassword"
          placeholder="Current password"
          value={passwordValues.currentPassword}
          error={passwordErrors.currentPassword}
          visible={Boolean(visiblePasswordFields.currentPassword)}
          disabled={submittingPassword}
          autoComplete="current-password"
          onChange={handlePasswordChange}
          onToggleVisibility={togglePasswordVisibility}
        />
        <PasswordPillInput
          field="newPassword"
          placeholder="New password"
          value={passwordValues.newPassword}
          error={passwordErrors.newPassword}
          visible={Boolean(visiblePasswordFields.newPassword)}
          disabled={submittingPassword}
          autoComplete="new-password"
          onChange={handlePasswordChange}
          onToggleVisibility={togglePasswordVisibility}
        />
        <PasswordPillInput
          field="confirmPassword"
          placeholder="Confirm password"
          value={passwordValues.confirmPassword}
          error={passwordErrors.confirmPassword}
          visible={Boolean(visiblePasswordFields.confirmPassword)}
          disabled={submittingPassword}
          autoComplete="new-password"
          onChange={handlePasswordChange}
          onToggleVisibility={togglePasswordVisibility}
        />

        <button
          type="submit"
          disabled={submittingPassword}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#5fb953] bg-[#8df86e] px-5 text-[0.95rem] font-medium text-[#010101] transition hover:bg-[#7eea60] focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-[1rem]"
        >
          {submittingPassword ? "Updating..." : "Update"}
        </button>

      </form>
    </section>
  );
}

function QuickActions({
  onAddPet,
  user,
}: {
  onAddPet: () => void;
  user: AppUser;
}) {
  const quickActions: QuickAction[] = [
    {
      href: ROUTES.pets,
      label: "My Pets",
      description: "Saved profiles and QR records",
      icon: PawPrint,
    },
    {
      action: "add-pet",
      label: "Add Pet",
      description: "Create another pet profile",
      icon: Plus,
    },
  ];

  if (VERIFICATION_ALLOWED_ROLES.includes(user.role)) {
    quickActions.push({
      href: ROUTES.adminVerification,
      label: "Verification",
      description: "Pet profiles waiting for review",
      icon: ShieldCheck,
    });
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quickActions.map((quickAction) => {
        const Icon = quickAction.icon;
        const content = (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#c8c8c8] bg-white text-[#1a202c]">
              <Icon className="h-5 w-5" strokeWidth={2.35} />
            </span>
            <span className="min-w-0">
              <span className="block text-[1rem] font-semibold text-[#1a202c]">
                {quickAction.label}
              </span>
              <span className="mt-1 block text-sm font-medium text-[#7a7878]">
                {quickAction.description}
              </span>
            </span>
          </>
        );

        if (quickAction.action === "add-pet") {
          return (
            <button
              key={quickAction.action}
              type="button"
              className="flex min-h-[96px] items-center gap-4 rounded-[18px] border border-[#1a202c] bg-white p-5 text-left shadow-[0_4px_4px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,32,44,0.14)] focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb] focus-visible:outline-none"
              onClick={onAddPet}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={quickAction.href}
            href={quickAction.href}
            className="flex min-h-[96px] items-center gap-4 rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,32,44,0.14)] focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb] focus-visible:outline-none"
          >
            {content}
          </Link>
        );
      })}
    </section>
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
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [addPetModalOpen, setAddPetModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  if (!appUser) {
    return null;
  }

  const profileValues = getProfileValues(appUser);
  const profileBusy = Boolean(savingField) || uploadingAvatar;

  function clearFieldError(field: EditableProfileField) {
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleEdit(field: EditableProfileField, value: string) {
    if (profileBusy) {
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
      toast.success("Profile updated.");
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

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(nextPreviewUrl);
    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const uploaded = await uploadCurrentUserProfileImage(file);

      await updateProfile(
        uploaded.type === "public"
          ? {
              avatarUrl: uploaded.url,
              avatarFileId: null,
              name: profileValues.name,
            }
          : {
              avatarFileId: uploaded.fileId,
              name: profileValues.name,
            },
      );
      toast.success("Avatar updated.");
    } catch (error) {
      setAvatarError(
        error instanceof Error
          ? error.message
          : "We could not upload this image right now.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb]">
      <div className="mx-auto flex w-full max-w-[1368px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 md:max-lg:max-w-[728px] md:max-lg:px-0 lg:px-8 lg:py-14">
        <div className="md:max-lg:hidden">
          <ProfileInfoCard
            avatarError={avatarError}
            avatarPreviewUrl={avatarPreviewUrl}
            disabled={profileBusy}
            draftValue={draftValue}
            editingField={editingField}
            fieldErrors={fieldErrors}
            profileValues={profileValues}
            savingField={savingField}
            uploadingAvatar={uploadingAvatar}
            user={appUser}
            onAvatarChange={handleAvatarChange}
            onCancelEdit={handleCancelEdit}
            onDraftChange={setDraftValue}
            onEdit={handleEdit}
            onSave={handleSave}
          />
        </div>

        <div className="hidden md:max-lg:block">
          <TabletProfileInfoCard
            avatarError={avatarError}
            avatarPreviewUrl={avatarPreviewUrl}
            disabled={profileBusy}
            draftValue={draftValue}
            editingField={editingField}
            fieldErrors={fieldErrors}
            profileValues={profileValues}
            savingField={savingField}
            uploadingAvatar={uploadingAvatar}
            user={appUser}
            onAvatarChange={handleAvatarChange}
            onCancelEdit={handleCancelEdit}
            onDraftChange={setDraftValue}
            onEdit={handleEdit}
            onSave={handleSave}
          />
        </div>

        <ChangePasswordCard />

        <QuickActions
          user={appUser}
          onAddPet={() => setAddPetModalOpen(true)}
        />
      </div>

      {addPetModalOpen ? (
        <AddPetModal onClose={() => setAddPetModalOpen(false)} />
      ) : null}
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
