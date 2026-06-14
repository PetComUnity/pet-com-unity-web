"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { uploadCurrentUserProfileImage } from "@/features/auth/auth.service";

export function useOwnerProfile() {
  const { appUser, updateProfile } = useAuth();

  const [profileValues, setProfileValues] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (appUser) {
      setProfileValues({
        name: appUser.name?.trim() ?? "",
        email: appUser.email?.trim() ?? "",
        phone: appUser.phone?.trim() ?? "",
        city: (appUser.address ?? appUser.city ?? (appUser as any).location)?.trim() ?? "",
      });
    }
  }, [appUser]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const updateField = (field: string, value: string) => {
    setProfileValues((prev) => ({ ...prev, [field]: value }));
    setSubmitSuccess(false);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitSuccess(false);

    try {
      await updateProfile({
        name: profileValues.name.trim(),
        phone: profileValues.phone.trim(),
        city: profileValues.city.trim(),
      });
      setSubmitSuccess(true);
    } catch (err) {
      setFieldErrors({ global: "Could not update user profile information." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
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
          ? { avatarUrl: uploaded.url, avatarFileId: null, name: profileValues.name }
          : { avatarFileId: uploaded.fileId, name: profileValues.name }
      );
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "We could not upload this image right now.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return {
    user: appUser,
    profileValues,
    isSubmitting,
    submitSuccess,
    fieldErrors,
    avatarPreviewUrl,
    uploadingAvatar,
    avatarError,
    updateField,
    handleFormSubmit,
    handleAvatarChange,
  };
}