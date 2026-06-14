"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";

// import {
//   getCurrentUser,
//   updateShelterProfileData,
// } from "@/features/auth/auth.service";

import {
  getCurrentUser,
  updateShelterProfileData,
} from "@/features/auth/auth.service";

export function useShelterProfile() {
  const { appUser } = useAuth();

  const [profileValues, setProfileValues] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    instagram: "",
    facebook: "",
    workingHours: "",
    registrationNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!appUser) return;

    const org = (appUser as any).organization || {};

    const links = Array.isArray(org.socialMediaLinks)
      ? org.socialMediaLinks
      : [];

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
          (link: any) =>
            link.platform?.toLowerCase() === "instagram"
        )?.url ?? "",

      facebook:
        links.find(
          (link: any) =>
            link.platform?.toLowerCase() === "facebook"
        )?.url ?? "",

      workingHours: org.workingHours
        ? JSON.stringify(org.workingHours, null, 2)
        : "",

      registrationNumber:
        org.registrationNumber ?? "",
    });
  }, [appUser]);

  const updateField = (
    field: string,
    value: string
  ) => {
    setProfileValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSubmitSuccess(false);
  };

  const handleFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitSuccess(false);

    try {
      const socialMediaLinks = [];

      if (profileValues.instagram.trim()) {
        socialMediaLinks.push({
          platform: "instagram",
          url: profileValues.instagram.trim(),
        });
      }

      if (profileValues.facebook.trim()) {
        socialMediaLinks.push({
          platform: "facebook",
          url: profileValues.facebook.trim(),
        });
      }

      const payload = {
        name: profileValues.name.trim(),
        email: profileValues.email.trim(),

        phoneNumbers: profileValues.phone.trim()
          ? [profileValues.phone.trim()]
          : [],

        location: profileValues.location.trim(),

        website: profileValues.website.trim(),

        socialMediaLinks,

        workingHours: profileValues.workingHours
          ? JSON.parse(profileValues.workingHours)
          : {},

        registrationNumber:
          profileValues.registrationNumber.trim() ||
          undefined,
      };

      await updateShelterProfileData(payload);

      if (typeof getCurrentUser === "function") {
        await getCurrentUser();
      }

      setSubmitSuccess(true);
    } catch (error: any) {
      setFieldErrors({
        global:
          error?.message ??
          "Could not update shelter information.",
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
  };
}