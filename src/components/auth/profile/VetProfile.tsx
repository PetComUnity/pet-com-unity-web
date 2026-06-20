"use client";

import { useVetProfile } from "@/hooks/useVetProfile"; 
import { Spinner } from "@/components/ui/Spinner";
import { useState } from "react";
import { WorkingHoursModal, type WorkingHours, DAYS } from "@/components/shared/WorkingHoursModal";
import { ProfileAvatarPanel } from "@/components/shared/ProfileAvatarPanel";

export function VetProfile() {
  const {
    user,
    profileValues,
    isSubmitting,
    fieldErrors,
    submitSuccess,
    updateField,
    handleFormSubmit,
    avatarPreviewUrl, 
    uploadingAvatar, 
    avatarError, 
    handleAvatarChange
  } = useVetProfile();

  const [hoursModalOpen, setHoursModalOpen] = useState(false);

  if (!user) return null;

  return (
    <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1a202c]">Clinic Profile</h2>
      </div>

      <form onSubmit={handleFormSubmit} className="grid gap-6 lg:grid-cols-[112px_minmax(0,1fr)] lg:gap-12">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-2">
          <ProfileAvatarPanel
            user={user}
            previewUrl={avatarPreviewUrl}
            uploading={uploadingAvatar}
            error={avatarError}
            onFileChange={handleAvatarChange}
          />
        </div>

        <div className="grid min-w-0 gap-6 lg:auto-rows-min lg:grid-cols-[minmax(220px,268px)_minmax(260px,1fr)_minmax(220px,268px)] lg:gap-x-[60px]">
          
          {/* Organization Name */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.name}
              placeholder="Clinic name"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          {/* Email Block */}
          <div className="min-w-0">
            <input
              type="email"
              value={profileValues.email}
              placeholder="email"
              disabled={true}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-[#f5f5f5] px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] cursor-not-allowed sm:text-[1rem]"
            />
          </div>

          {/* Phone Numbers */}
          <div className="min-w-0">
            <input
              type="tel"
              value={profileValues.phone}
              placeholder="contact number"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.location}
              placeholder="Location Address"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>

          {/* Website Link */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.website}
              placeholder="Website URL"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("website", e.target.value)}
            />
          </div>

          {/* Registration Number */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.registrationNumber}
              placeholder="Registration Number"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("registrationNumber", e.target.value)}
            />
          </div>

          {/* Instagram */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.instagram}
              placeholder="Instagram URL"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("instagram", e.target.value)}
            />
          </div>

          {/* Facebook */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.facebook}
              placeholder="Facebook URL"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("facebook", e.target.value)}
            />
          </div>
          
          {/* Operating Hours Display */}
          <div className="min-w-0 lg:col-span-2">
            <div className="rounded-[14px] border border-[#c8c8c8] p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="w-full">
                  <h4 className="font-medium text-[#1a202c] mb-2">Operating Hours</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {DAYS.map((day) => (
                      <p key={day} className="text-xs text-gray-500 capitalize">
                        {day}: {profileValues.workingHours[day]?.start ?? "--:--"} - {profileValues.workingHours[day]?.end ?? "--:--"}
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHoursModalOpen(true)}
                  className="rounded-[12px] border border-[#c8c8c8] px-4 py-2 text-sm font-medium transition hover:bg-gray-50 whitespace-nowrap"
                >
                  Edit Hours
                </button>
              </div>
            </div>
          </div>

          {/* Feedback & Submit */}
          <div className="col-span-full space-y-2">
            {submitSuccess && <p className="text-sm font-semibold text-[#166534]">Clinic profile saved successfully.</p>}
            {fieldErrors.global && <p className="text-sm font-medium text-[#b91c1c]">{fieldErrors.global}</p>}
          </div>

          <div className="col-span-full flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full sm:w-[170px] items-center justify-center gap-2 rounded-[14px] border border-[#5fb953] bg-[#8df86e] px-5 text-[0.95rem] font-medium text-[#010101] transition hover:bg-[#7eea60] sm:text-[1rem]"
            >
              {isSubmitting ? (
                <><Spinner className="h-4 w-4 animate-spin" /> Saving...</>
              ) : "Save Profile"}
            </button>
          </div>
        </div>
      </form>
      
      <WorkingHoursModal
        isOpen={hoursModalOpen}
        value={profileValues.workingHours}
        onClose={() => setHoursModalOpen(false)}
        onSave={(hours: WorkingHours) => updateField("workingHours", hours)}
      />
    </section>
  );
}