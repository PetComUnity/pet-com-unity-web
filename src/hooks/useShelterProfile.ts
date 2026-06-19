"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getCurrentUser,
  updateShelterProfileData,
} from "@/features/auth/auth.service";
import { type WorkingHours } from "@/components/shared/WorkingHoursModal"; 
// 1. Import the shared avatar hook
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
  // 2. Destructure updateProfile from useAuth (required by useProfileAvatar)
  const { appUser, updateProfile } = useAuth();

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

  // 3. Initialize Avatar Logic
  const avatarLogic = useProfileAvatar(updateProfile, profileValues.name);

  useEffect(() => {
    if (!appUser) return;

    const org = (appUser as any).organization || {};
    const links = Array.isArray(org.socialMediaLinks) ? org.socialMediaLinks : [];

    setProfileValues({
      name: org.name ?? appUser.name ?? "",
      email: org.email ?? appUser.email ?? "",
      phone: Array.isArray(org.phoneNumbers) ? org.phoneNumbers[0] ?? "" : "",
      location: org.location ?? "",
      website: org.website ?? "",
      instagram: links.find((l: any) => l.platform?.toLowerCase() === "instagram")?.url ?? "",
      facebook: links.find((l: any) => l.platform?.toLowerCase() === "facebook")?.url ?? "",
      workingHours: org.workingHours ?? DEFAULT_WORKING_HOURS,
      registrationNumber: org.registrationNumber ?? "",
    });
  }, [appUser]);

  const updateField = (field: string, value: any) => {
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
        profileValues.instagram.trim() && { platform: "instagram", url: profileValues.instagram.trim() },
        profileValues.facebook.trim() && { platform: "facebook", url: profileValues.facebook.trim() },
      ].filter(Boolean);

      const payload = {
        name: profileValues.name.trim(),
        email: profileValues.email.trim(),
        phoneNumbers: profileValues.phone.trim() ? [profileValues.phone.trim()] : [],
        location: profileValues.location.trim(),
        website: profileValues.website.trim(),
        socialMediaLinks,
        workingHours: profileValues.workingHours,
        registrationNumber: profileValues.registrationNumber.trim() || undefined,
      };

      await updateShelterProfileData(payload);
      if (typeof getCurrentUser === "function") await getCurrentUser();
      setSubmitSuccess(true);
    } catch (error: any) {
      setFieldErrors({ global: error?.message ?? "Could not update shelter information." });
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
    // 4. Spread the avatar logic here
    ...avatarLogic, 
  };
}