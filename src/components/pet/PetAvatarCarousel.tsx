"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PrivateImage } from "@/components/common/PrivateImage";
import { getColorForPet } from "@/features/pets/pet-theme-colors";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

const DEFAULT_VISIBLE_COUNT = 3;

type PetAvatarCarouselProps = {
  pets: Pet[];
  activePetId?: string | null;
  allowDeselect?: boolean;
  centerActivePet?: boolean;
  className?: string;
  controlVariant?: "circle" | "minimal";
  dimInactivePets?: boolean;
  fallbackImageSrc?: string;
  getPetHref?: (pet: Pet) => string;
  listClassName?: string;
  onSelectPet?: (petId: string | null) => void;
  paginationMode?: "window" | "pages";
  showNameTooltip?: boolean;
  variant?: "ring" | "filter";
  visibleCount?: number;
};

function getStartIndexForActivePet(
  pets: Pet[],
  activePetId: string | null | undefined,
  visibleCount: number,
  paginationMode: "window" | "pages",
) {
  if (!activePetId) {
    return 0;
  }

  const activePetIndex = pets.findIndex((pet) => pet.id === activePetId);
  if (activePetIndex < 0) {
    return 0;
  }

  if (paginationMode === "pages") {
    return Math.floor(activePetIndex / visibleCount) * visibleCount;
  }

  const activePetOffset = Math.floor(visibleCount / 2);
  const maxStartIndex = Math.max(0, pets.length - visibleCount);

  if (activePetIndex <= activePetOffset) {
    return 0;
  }

  return Math.min(activePetIndex - activePetOffset, maxStartIndex);
}

function getLastStartIndex(
  petCount: number,
  visibleCount: number,
  paginationMode: "window" | "pages",
) {
  if (paginationMode === "pages") {
    const totalPages = Math.ceil(petCount / visibleCount);
    return Math.max(0, (totalPages - 1) * visibleCount);
  }

  return Math.max(0, petCount - visibleCount);
}

function getPetInitial(pet: Pet) {
  return pet.name.trim().charAt(0).toUpperCase() || "?";
}

function PetAvatarImage({
  fallbackImageSrc,
  pet,
}: {
  fallbackImageSrc?: string;
  pet: Pet;
}) {
  const themeColor = getColorForPet(pet.themeColor);
  const publicImageSrc = pet.imageUrl;

  return (
    <span
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: themeColor }}
    >
      <span aria-hidden="true">{getPetInitial(pet)}</span>
      {pet.imageFileId ? (
        <PrivateImage
          fileId={pet.imageFileId}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fallbackSrc={fallbackImageSrc}
        />
      ) : publicImageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={publicImageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </span>
  );
}

type PetAvatarCarouselWindowProps = Omit<
  PetAvatarCarouselProps,
  "centerActivePet" | "paginationMode" | "visibleCount"
> & {
  initialStartIndex: number;
  lastStartIndex: number;
  safeVisibleCount: number;
  stepSize: number;
};

function PetAvatarCarouselWindow({
  pets,
  activePetId,
  allowDeselect = false,
  className,
  controlVariant = "circle",
  dimInactivePets = false,
  fallbackImageSrc,
  getPetHref,
  listClassName,
  onSelectPet,
  showNameTooltip = false,
  variant = "ring",
  initialStartIndex,
  lastStartIndex,
  safeVisibleCount,
  stepSize,
}: PetAvatarCarouselWindowProps) {
  const [requestedStartIndex, setRequestedStartIndex] =
    useState(initialStartIndex);
  const startIndex = Math.min(requestedStartIndex, lastStartIndex);
  const visiblePets = pets.slice(startIndex, startIndex + safeVisibleCount);
  const hasMorePets = pets.length > safeVisibleCount;

  function showPreviousPets() {
    setRequestedStartIndex((currentStartIndex) =>
      Math.max(0, Math.min(currentStartIndex, lastStartIndex) - stepSize),
    );
  }

  function showNextPets() {
    setRequestedStartIndex((currentStartIndex) =>
      Math.min(
        lastStartIndex,
        Math.min(currentStartIndex, lastStartIndex) + stepSize,
      ),
    );
  }

  function handleSelectPet(pet: Pet, isActive: boolean) {
    onSelectPet?.(allowDeselect && isActive ? null : pet.id);
  }

  if (visiblePets.length === 0) {
    return null;
  }

  const controlClassName =
    controlVariant === "minimal"
      ? "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#f38c2c] transition hover:bg-[#fff4e8] focus-visible:ring-2 focus-visible:ring-[#ff8a24]/35 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30"
      : "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1a202c]/20 bg-white text-[#1a202c] transition hover:-translate-y-0.5 hover:bg-[#fff4e8] focus-visible:ring-2 focus-visible:ring-[#ff8a24]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35";
  const controlIconClassName =
    controlVariant === "minimal" ? "h-4 w-4" : "h-5 w-5";
  const defaultListClassName =
    variant === "filter"
      ? "min-w-[144px] justify-center gap-3"
      : "w-[132px] justify-center gap-3";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {hasMorePets ? (
        <button
          type="button"
          aria-label="Show previous pets"
          title="Show previous pets"
          disabled={startIndex === 0}
          onClick={showPreviousPets}
          className={controlClassName}
        >
          <ChevronLeft className={controlIconClassName} aria-hidden="true" />
        </button>
      ) : null}

      <div
        className={cn(
          "flex items-center",
          defaultListClassName,
          listClassName,
        )}
      >
        {visiblePets.map((pet) => {
          const themeColor = getColorForPet(pet.themeColor);
          const isActive = activePetId === pet.id;
          const isDimmed = Boolean(activePetId && dimInactivePets && !isActive);
          const avatarStyle = {
            ...(variant === "ring"
              ? { "--tw-ring-color": themeColor }
              : { backgroundColor: themeColor }),
            opacity: isDimmed ? 0.5 : 1,
          } as CSSProperties;
          const avatarClassName = cn(
            "relative inline-flex shrink-0 items-center justify-center rounded-full transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:outline-none",
            variant === "ring"
              ? "h-9 w-9 overflow-hidden bg-white ring-[3px] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              : "h-10 w-10 p-[3px] focus-visible:ring-offset-2",
            isActive ? "scale-105" : "",
          );
          const avatar = (
            <PetAvatarImage fallbackImageSrc={fallbackImageSrc} pet={pet} />
          );
          const href = getPetHref?.(pet);

          return (
            <div
              key={pet.id}
              className="group relative flex flex-col items-center"
            >
              {href ? (
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Open ${pet.name} details`}
                  title={pet.name}
                  className={avatarClassName}
                  style={avatarStyle}
                >
                  {avatar}
                </Link>
              ) : onSelectPet ? (
                <button
                  type="button"
                  aria-label={
                    allowDeselect && isActive
                      ? `Clear ${pet.name} selection`
                      : `Select ${pet.name}`
                  }
                  aria-pressed={isActive}
                  title={pet.name}
                  onClick={() => handleSelectPet(pet, isActive)}
                  className={avatarClassName}
                  style={avatarStyle}
                >
                  {avatar}
                </button>
              ) : (
                <span className={avatarClassName} style={avatarStyle}>
                  {avatar}
                </span>
              )}

              {showNameTooltip ? (
                <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-[#969696] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  {pet.name}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {hasMorePets ? (
        <button
          type="button"
          aria-label="Show next pets"
          title="Show next pets"
          disabled={startIndex >= lastStartIndex}
          onClick={showNextPets}
          className={controlClassName}
        >
          <ChevronRight className={controlIconClassName} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function PetAvatarCarousel({
  pets,
  activePetId,
  centerActivePet = false,
  paginationMode = "window",
  visibleCount = DEFAULT_VISIBLE_COUNT,
  ...props
}: PetAvatarCarouselProps) {
  const safeVisibleCount = Math.max(1, visibleCount);
  const lastStartIndex = getLastStartIndex(
    pets.length,
    safeVisibleCount,
    paginationMode,
  );
  const activeStartIndex = getStartIndexForActivePet(
    pets,
    activePetId,
    safeVisibleCount,
    paginationMode,
  );
  const initialStartIndex = centerActivePet
    ? Math.min(activeStartIndex, lastStartIndex)
    : 0;
  const resetKey = centerActivePet
    ? `${activePetId ?? "none"}:${pets.map((pet) => pet.id).join("|")}`
    : "manual";

  return (
    <PetAvatarCarouselWindow
      key={resetKey}
      {...props}
      pets={pets}
      activePetId={activePetId}
      initialStartIndex={initialStartIndex}
      lastStartIndex={lastStartIndex}
      safeVisibleCount={safeVisibleCount}
      stepSize={paginationMode === "pages" ? safeVisibleCount : 1}
    />
  );
}
