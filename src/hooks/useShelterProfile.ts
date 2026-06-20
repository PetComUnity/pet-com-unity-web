"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateShelterProfileData } from "@/features/auth/auth.service";
import { type WorkingHours } from "@/components/shared/WorkingHoursModal";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { start: "08:00", end: "20:00" },
  tuesday: { start: "08:00", end: "20:00" },
  wednesday: { start: "08:00", end: "20:00" },
  thursday: { start: "08:00", end: "20:00" },
  friday: { start: "08:00", end: "20:00" },
  saturday: { start: "09:00", end: "14:00" },
  sunday: { start: "09:00", end: "14:00" },
};

export function useShelterProfile() {
  const { appUser, updateProfile, getCurrentUser: refreshUser } = useAuth();

  const [profileValues, setProfileValues] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    instagram: "",
    facebook: "",
    workingHours: DEFAULT_WORKING_HOURS,
    registrationNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const avatarLogic = useProfileAvatar(updateProfile, profileValues.name);

  useEffect(() => {
    if (!appUser) return;

    const org =
      (appUser as {
        organization?: any;
      }).organization ?? {};

    const links = Array.isArray(org.socialMediaLinks)
      ? org.socialMediaLinks
      : [];

    const workingHours = org.workingHours ?? DEFAULT_WORKING_HOURS;

    setProfileValues({
      name: org.name ?? appUser.name ?? "",
      email: org.email ?? appUser.email ?? "",
      phone: Array.isArray(org.phoneNumbers)
        ? org.phoneNumbers[0] ?? ""
        : "",
      location: org.location ?? "",
      website: org.website ?? "",
      instagram:
        links.find(
          (link: { platform?: string; url?: string }) =>
            link.platform?.toLowerCase() === "instagram",
        )?.url ?? "",
      facebook:
        links.find(
          (link: { platform?: string; url?: string }) =>
            link.platform?.toLowerCase() === "facebook",
        )?.url ?? "",
      workingHours,
      registrationNumber: org.registrationNumber ?? "",
    });
  }, [appUser?.id]); // ✅ ONLY CHANGE HERE

  const updateField = (field: string, value: unknown) => {
    setProfileValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSubmitSuccess(false);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitSuccess(false);

    try {
      const socialMediaLinks = [
        profileValues.instagram.trim() && {
          platform: "instagram",
          url: profileValues.instagram.trim(),
        },
        profileValues.facebook.trim() && {
          platform: "facebook",
          url: profileValues.facebook.trim(),
        },
      ].filter(Boolean);

      const payload = {
        name: profileValues.name.trim(),
        email: profileValues.email.trim(),
        phoneNumbers: profileValues.phone.trim()
          ? [profileValues.phone.trim()]
          : [],
        location: profileValues.location.trim(),
        website: profileValues.website.trim(),
        socialMediaLinks,
        workingHours: profileValues.workingHours,
        registrationNumber:
          profileValues.registrationNumber.trim() || undefined,
      };

      await updateShelterProfileData(payload);

      await refreshUser();

      setSubmitSuccess(true);
    } catch (error: unknown) {
      setFieldErrors({
        global:
          error instanceof Error
            ? error.message
            : "Could not update shelter information.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user: appUser,
    profileValues,
    isSubmitting,
    submitSuccess,
    fieldErrors,
    updateField,
    handleFormSubmit,
    ...avatarLogic,
  };
}