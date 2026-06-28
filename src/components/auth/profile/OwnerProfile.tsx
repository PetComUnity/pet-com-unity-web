"use client";

import Image from "next/image";
import { useOwnerProfile } from "@/hooks/useOwnerProfile"; 
import { PrivateImage } from "@/components/common/PrivateImage";
import { Edit3 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export function OwnerProfile() {
  const {
    user,
    profileValues,
    isSubmitting,
    fieldErrors,
    submitSuccess,
    updateField,
    handleFormSubmit,
    handleAvatarChange,
    avatarPreviewUrl,
    uploadingAvatar,
    avatarError
  } = useOwnerProfile();

  if (!user) return null;

  const fileId = user.imageFileId ?? user.avatarFileId;
  const imageUrl = avatarPreviewUrl ?? user.imageUrl ?? user.avatarUrl;

  return (
    // EXACT ORIGINAL CARD STYLING & SHADOW MATRIX
    <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.22)] sm:p-6">
      <form onSubmit={handleFormSubmit} className="grid gap-6 lg:grid-cols-[112px_minmax(0,1fr)] lg:gap-12">
        
        {/* EXACT ORIGINAL AVATAR PANEL COMPONENT */}
        <div className="flex flex-col items-center gap-3 md:max-lg:items-start lg:items-start">
          <label className="group relative block h-[100px] w-[100px] cursor-pointer overflow-hidden rounded-[18px] border border-[#c8c8c8] bg-white focus-within:ring-2 focus-within:ring-[#1a202c]/20 md:max-lg:h-20">
            <span className="sr-only">Upload profile avatar</span>
            <Image
              src="/images/placeholder-owner-avatar.png"
              alt=""
              fill
              priority
              sizes="100px"
              className="object-cover"
            />

            {fileId && !avatarPreviewUrl ? (
              <PrivateImage
                fileId={fileId}
                alt="Profile avatar"
                fallbackSrc="/images/placeholder-owner-avatar.png"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}

            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile avatar"
                fill
                unoptimized
                sizes="100px"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}

            <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
              <Edit3 className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingAvatar}
              onChange={(e) => e.target.files?.[0] && handleAvatarChange(e.target.files[0])}
            />
          </label>

          <label className="inline-flex min-h-5 w-[100px] cursor-pointer items-center justify-center rounded-full bg-[#ff8a24] px-3 text-center text-[10px] font-semibold text-white transition focus-within:ring-2 focus-within:ring-[#1a202c]/25 focus-within:ring-offset-2 focus-within:outline-none hover:bg-[#e87918]">
            {uploadingAvatar ? "Uploading..." : "+ Avatar"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingAvatar}
              onChange={(e) => e.target.files?.[0] && handleAvatarChange(e.target.files[0])}
            />
          </label>

          {avatarError && (
            <p className="max-w-[132px] text-center text-xs font-medium text-[#b91c1c] lg:text-left">{avatarError}</p>
          )}
        </div>

        {/* EXACT ORIGINAL INPUT LAYOUT GRID MATRIX */}
        <div className="grid min-w-0 gap-6 lg:auto-rows-min lg:grid-cols-[minmax(220px,268px)_minmax(260px,1fr)_minmax(220px,268px)] lg:gap-x-[60px]">
          
          {/* Full Name */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.name}
              placeholder="Full name"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("name", e.target.value)}
            />
            {fieldErrors.name && <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{fieldErrors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="min-w-0">
            <input
              type="email"
              value={profileValues.email}
              placeholder="email"
              disabled={true} // System unique key read-only
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-[#f5f5f5] px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] cursor-not-allowed sm:text-[1rem]"
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          {/* Contact Number */}
          <div className="min-w-0">
            <input
              type="tel"
              value={profileValues.phone}
              placeholder="contact number"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("phone", e.target.value)}
            />
            {fieldErrors.phone && <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{fieldErrors.phone}</p>}
          </div>

          {/* Address */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.city}
              placeholder="Address"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("city", e.target.value)}
            />
            {fieldErrors.city && <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{fieldErrors.city}</p>}
          </div>

          {/* EXACT ORIGINAL GREEN ROLE PILL POSITION */}
          <div className="min-w-0 lg:col-start-3 lg:row-start-2">
            <div className="flex h-11 w-full items-center justify-center rounded-[14px] border border-[#5fb953] bg-[#8df86e] px-5 text-center text-[0.95rem] font-medium text-[#010101] sm:text-[1rem]">
              Owner
            </div>
          </div>

          {/* Alert messages inside layout flow */}
          <div className="col-span-full space-y-2">
            {submitSuccess && (
              <p className="text-sm font-semibold text-[#166534]">Profile updated successfully.</p>
            )}
            {fieldErrors.global && (
              <p className="text-sm font-medium text-[#b91c1c]">{fieldErrors.global}</p>
            )}
          </div>

          {/* Master Save Trigger using exact matching button specifications */}
          <div className="col-span-full flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full sm:w-[170px] items-center justify-center gap-2 rounded-[14px] border border-[#5fb953] bg-[#8df86e] px-5 text-[0.95rem] font-medium text-[#010101] transition hover:bg-[#7eea60] focus-visible:ring-2 focus-visible:ring-[#1a202c]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-[1rem]"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 animate-spin text-[#010101]" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>

        </div>
      </form>
    </section>
  );
}
