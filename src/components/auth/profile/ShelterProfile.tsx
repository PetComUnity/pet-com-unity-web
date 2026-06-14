"use client";

import { useShelterProfile } from "@/hooks/useShelterProfile"; 
import { Spinner } from "@/components/ui/Spinner";

export function ShelterProfile() {
  const {
    user,
    profileValues,
    isSubmitting,
    fieldErrors,
    submitSuccess,
    updateField,
    handleFormSubmit,
  } = useShelterProfile();

  if (!user) return null;

  return (
    // EXACT ORIGINAL CARD STYLING & SHADOW MATRIX
    <section className="rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1a202c]">Shelter Profile</h2>
        <p className="text-sm text-gray-500">Manage your organization and rescue facilities data fields</p>
      </div>

      <form onSubmit={handleFormSubmit} className="grid gap-6 lg:grid-cols-[112px_minmax(0,1fr)] lg:gap-12">
        
        {/* Placeholder spacer box to maintain exact 112px alignment spacing as Owner Avatar */}
        <div className="hidden lg:block w-[112px]" />

        {/* EXACT ORIGINAL INPUT LAYOUT GRID MATRIX */}
        <div className="grid min-w-0 gap-6 lg:auto-rows-min lg:grid-cols-[minmax(220px,268px)_minmax(260px,1fr)_minmax(220px,268px)] lg:gap-x-[60px]">
          
          {/* Organization Name */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.name}
              placeholder="Shelter name"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("name", e.target.value)}
            />
            {fieldErrors.name && <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{fieldErrors.name}</p>}
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
            {fieldErrors.phone && <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{fieldErrors.phone}</p>}
          </div>

          {/* Organization Location */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.location}
              placeholder="Address"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("location", e.target.value)}
            />
            {fieldErrors.location && <p className="mt-1 px-4 text-xs font-medium text-[#b91c1c]">{fieldErrors.location}</p>}
          </div>

          {/* Website Link */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.website}
              placeholder="Website link"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("website", e.target.value)}
            />
          </div>

          {/* License Identifier */}
          <div className="min-w-0">
            <input
              type="text"
              value={profileValues.registrationNumber}
              placeholder="Registration/License ID"
              disabled={isSubmitting}
              className="block h-11 w-full min-w-0 rounded-[14px] border border-[#c8c8c8] bg-white px-4 text-[0.95rem] font-medium text-[#1a202c] transition outline-none placeholder:text-[#b8b8b8] focus:border-[#1a202c] focus:ring-2 focus:ring-[#1a202c]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] sm:text-[1rem]"
              onChange={(e) => updateField("registrationNumber", e.target.value)}
            />
          </div>

          {/* Social Links Row Block */}
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

          {/* EXACT ORIGINAL GREEN ROLE PILL POSITION */}
          <div className="min-w-0 lg:col-start-3 lg:row-start-3">
            <div className="flex h-11 w-full items-center justify-center rounded-[14px] border border-[#5fb953] bg-[#8df86e] px-5 text-center text-[0.95rem] font-medium text-[#010101] sm:text-[1rem]">
              Shelter
            </div>
          </div>

          {/* Feedback section hooks */}
          <div className="col-span-full space-y-2">
            {submitSuccess && (
              <p className="text-sm font-semibold text-[#166534]">Shelter data details committed successfully.</p>
            )}
            {fieldErrors.global && (
              <p className="text-sm font-medium text-[#b91c1c]">{fieldErrors.global}</p>
            )}
          </div>

          {/* EXACT ORIGINAL GREEN DESIGN SAVE BUTTON */}
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