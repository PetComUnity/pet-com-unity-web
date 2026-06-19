"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getCurrentUser,
  updateVetClinicProfile,
} from "@/features/auth/auth.service";
// 1. Import the shared logic hook
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

export function useVetProfile() {
  // Destructure updateProfile to allow the avatar hook to save the image
  const { appUser, updateProfile } = useAuth();

  const [profileValues, setProfileValues] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    instagram: "",
    facebook: "",
    registrationNumber: "",
    workingHours: {
      monday: { start: "08:00", end: "20:00" },
      tuesday: { start: "08:00", end: "20:00" },
      wednesday: { start: "08:00", end: "20:00" },
      thursday: { start: "08:00", end: "20:00" },
      friday: { start: "08:00", end: "20:00" },
      saturday: { start: "09:00", end: "14:00" },
      sunday: { start: "09:00", end: "14:00" },
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 2. Initialize Avatar Logic
  // This provides: avatarPreviewUrl, uploadingAvatar, avatarError, handleAvatarChange
  const avatarLogic = useProfileAvatar(updateProfile, profileValues.name);

  useEffect(() => {
    if (!appUser) return;

    const org = (appUser as any).organization || {};
    const links = Array.isArray(org.socialMediaLinks) ? org.socialMediaLinks : [];
    const workingHours = org.workingHours || {};

    setProfileValues({
      name: org.name ?? appUser.name ?? "",
      email: org.email ?? appUser.email ?? "",
      phone: Array.isArray(org.phoneNumbers) ? org.phoneNumbers[0] ?? "" : "",
      location: org.location ?? "",
      website: org.website ?? "",
      instagram: links.find((link: any) => link.platform?.toLowerCase() === "instagram")?.url ?? "",
      facebook: links.find((link: any) => link.platform?.toLowerCase() === "facebook")?.url ?? "",
      registrationNumber: org.registrationNumber ?? "",
      workingHours: {
        monday: { 
          start: workingHours.monday?.start ?? "08:00", 
          end: workingHours.monday?.end ?? "20:00" 
        },
        tuesday: { 
          start: workingHours.tuesday?.start ?? "08:00", 
          end: workingHours.tuesday?.end ?? "20:00" 
        },
        wednesday: { 
          start: workingHours.wednesday?.start ?? "08:00", 
          end: workingHours.wednesday?.end ?? "20:00" 
        },
        thursday: { 
          start: workingHours.thursday?.start ?? "08:00", 
          end: workingHours.thursday?.end ?? "20:00" 
        },
        friday: { 
          start: workingHours.friday?.start ?? "08:00", 
          end: workingHours.friday?.end ?? "20:00" 
        },
        saturday: { 
          start: workingHours.saturday?.start ?? "09:00", 
          end: workingHours.saturday?.end ?? "14:00" 
        },
        sunday: { 
          start: workingHours.sunday?.start ?? "09:00", 
          end: workingHours.sunday?.end ?? "14:00" 
        },
      },
    });
  }, [appUser]);

  const updateField = (field: string, value: any) => {
    setProfileValues((prev) => ({ ...prev, [field]: value }));
    setSubmitSuccess(false);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitSuccess(false);

    try {
      const socialMediaLinks = [];
      if (profileValues.instagram.trim()) {
        socialMediaLinks.push({ platform: "instagram", url: profileValues.instagram.trim() });
      }
      if (profileValues.facebook.trim()) {
        socialMediaLinks.push({ platform: "facebook", url: profileValues.facebook.trim() });
      }

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

      await updateVetClinicProfile(payload);

      if (typeof getCurrentUser === "function") {
        await getCurrentUser();
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      setFieldErrors({
        global: err?.message || "Could not update clinic information.",
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
    // 3. Return the avatar state and handlers to the component
    ...avatarLogic, 
  };
}