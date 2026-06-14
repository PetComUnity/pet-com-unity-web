"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, updateVetClinicProfile } from "@/features/auth/auth.service";

export function useVetProfile() {
  // We pull getCurrentUser from useAuth to refresh the state after a successful update
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

  // Populate form fields whenever appUser changes
  useEffect(() => {
    if (appUser) {
      const org = (appUser as any).organization || {};
      const links = Array.isArray(org.socialMediaLinks) ? org.socialMediaLinks : [];
      
      setProfileValues({
        name: org.name ?? appUser.name ?? "",
        email: org.email ?? appUser.email ?? "",
        phone: Array.isArray(org.phoneNumbers) ? org.phoneNumbers[0] ?? "" : "",
        location: org.location ?? "",
        website: org.website ?? "",
        instagram: links.find((l: any) => l.platform?.toLowerCase() === 'instagram')?.url ?? "",
        facebook: links.find((l: any) => l.platform?.toLowerCase() === 'facebook')?.url ?? "",
        workingHours: org.workingHours ? JSON.stringify(org.workingHours, null, 2) : "",
        registrationNumber: org.registrationNumber ?? "",
      });
    }
  }, [appUser]);

  const updateField = (field: string, value: string) => {
    setProfileValues((prev) => ({ ...prev, [field]: value }));
    setSubmitSuccess(false);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitSuccess(false);

    const socialArray = [];
    if (profileValues.instagram.trim()) {
      socialArray.push({ platform: "instagram", url: profileValues.instagram.trim() });
    }
    if (profileValues.facebook.trim()) {
      socialArray.push({ platform: "facebook", url: profileValues.facebook.trim() });
    }

    const payload = {
      name: profileValues.name.trim(),
      email: profileValues.email.trim(),
      phoneNumbers: profileValues.phone.trim() ? [profileValues.phone.trim()] : [],
      location: profileValues.location.trim(),
      website: profileValues.website.trim(),
      socialMediaLinks: socialArray,
      workingHours: profileValues.workingHours ? JSON.parse(profileValues.workingHours) : {},
      // Ensure we don't send an empty string for registrationNumber if it's not set
      registrationNumber: profileValues.registrationNumber.trim() || undefined,
    };

    try {
      // 1. Send update to the backend
      await updateVetClinicProfile(payload);
      
      // 2. Refetch the user data from the server to update the global appUser state
      if (typeof getCurrentUser === 'function') {
        await getCurrentUser();
      }
      
      setSubmitSuccess(true);
    } catch (err: any) {
      setFieldErrors({ global: err.message || "Could not update clinic information." });
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