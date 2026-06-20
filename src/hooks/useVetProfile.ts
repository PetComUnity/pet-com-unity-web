"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateVetClinicProfile } from "@/features/auth/auth.service";
import { type MongoOrganization } from "@/components/auth/profile/profile.types";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

const DEFAULT_WORKING_HOURS = {
  monday: { start: "08:00", end: "20:00" },
  tuesday: { start: "08:00", end: "20:00" },
  wednesday: { start: "08:00", end: "20:00" },
  thursday: { start: "08:00", end: "20:00" },
  friday: { start: "08:00", end: "20:00" },
  saturday: { start: "09:00", end: "14:00" },
  sunday: { start: "09:00", end: "14:00" },
};

export function useVetProfile() {
  const { appUser, updateProfile, getCurrentUser: refreshUser } = useAuth();

  const [profileValues, setProfileValues] = useState(() => {
    const org = (appUser?.organization ?? {}) as Partial<MongoOrganization>;
    const links = Array.isArray(org.socialMediaLinks)
      ? org.socialMediaLinks
      : [];
    const workingHours = org.workingHours;

    return {
      name: org.name ?? appUser?.name ?? "",
      email: org.email ?? appUser?.email ?? "",
      phone: Array.isArray(org.phoneNumbers)
        ? org.phoneNumbers[0] ?? ""
        : "",
      location: org.location ?? "",
      website: org.website ?? "",
      instagram:
        links.find(
          (link) => link.platform?.toLowerCase() === "instagram",
        )?.url ?? "",
      facebook:
        links.find(
          (link) => link.platform?.toLowerCase() === "facebook",
        )?.url ?? "",
      registrationNumber: org.registrationNumber ?? "",
      workingHours: {
        monday: {
          start:
            workingHours?.monday?.start ?? DEFAULT_WORKING_HOURS.monday.start,
          end: workingHours?.monday?.end ?? DEFAULT_WORKING_HOURS.monday.end,
        },
        tuesday: {
          start:
            workingHours?.tuesday?.start ?? DEFAULT_WORKING_HOURS.tuesday.start,
          end: workingHours?.tuesday?.end ?? DEFAULT_WORKING_HOURS.tuesday.end,
        },
        wednesday: {
          start:
            workingHours?.wednesday?.start ??
            DEFAULT_WORKING_HOURS.wednesday.start,
          end:
            workingHours?.wednesday?.end ??
            DEFAULT_WORKING_HOURS.wednesday.end,
        },
        thursday: {
          start:
            workingHours?.thursday?.start ??
            DEFAULT_WORKING_HOURS.thursday.start,
          end:
            workingHours?.thursday?.end ??
            DEFAULT_WORKING_HOURS.thursday.end,
        },
        friday: {
          start:
            workingHours?.friday?.start ?? DEFAULT_WORKING_HOURS.friday.start,
          end: workingHours?.friday?.end ?? DEFAULT_WORKING_HOURS.friday.end,
        },
        saturday: {
          start:
            workingHours?.saturday?.start ??
            DEFAULT_WORKING_HOURS.saturday.start,
          end:
            workingHours?.saturday?.end ??
            DEFAULT_WORKING_HOURS.saturday.end,
        },
        sunday: {
          start:
            workingHours?.sunday?.start ?? DEFAULT_WORKING_HOURS.sunday.start,
          end: workingHours?.sunday?.end ?? DEFAULT_WORKING_HOURS.sunday.end,
        },
      },
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const avatarLogic = useProfileAvatar(updateProfile, profileValues.name);

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
        workingHours: profileValues.workingHours,
        registrationNumber:
          profileValues.registrationNumber.trim() || undefined,
      };

      await updateVetClinicProfile(payload);

      await refreshUser();

      setSubmitSuccess(true);
    } catch (err: unknown) {
      setFieldErrors({
        global:
          err instanceof Error
            ? err.message
            : "Could not update clinic information.",
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
