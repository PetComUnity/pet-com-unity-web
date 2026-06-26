"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PawPrint, Trash2 } from "lucide-react";
import { getPetDetailsRoute } from "@/constants/routes";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PrivateImage } from "@/components/common/PrivateImage";
import { deletePet } from "@/features/pets/pet-api.service";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

function PetImagePlaceholder({ className }: { className: string }) {
  return (
    <div
      className={`${className} flex items-center justify-center bg-[#f0ebe4]`}
    >
      <PawPrint className="h-1/2 w-1/2 text-[#c9b99a]" />
    </div>
  );
}

type MyPetCardProps = {
  pet: Pet;
  onDeleted?: (petId: string) => void;
};

function DeletePetButton({
  pet,
  onDeleted,
  className,
}: {
  pet: Pet;
  onDeleted?: (petId: string) => void;
  className?: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleConfirm() {
    setConfirmOpen(false);

    try {
      setDeleting(true);
      await deletePet(pet.id);
      if (onDeleted) {
        onDeleted(pet.id);
      } else {
        setDeleting(false);
      }
    } catch (error) {
      setDeleting(false);
      // error is shown via the toast in the parent or re-thrown — keep a fallback
      window.alert(
        error instanceof Error
          ? error.message
          : "We could not delete this pet right now.",
      );
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${pet.name}`}
        title={deleting ? "Deleting..." : `Delete ${pet.name}`}
        disabled={deleting}
        onClick={() => setConfirmOpen(true)}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#ff2d2d] transition hover:-translate-y-0.5 hover:bg-[#ff2d2d]/10 focus-visible:ring-2 focus-visible:ring-[#ff2d2d]/30 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <Trash2 className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${pet.name}?`}
        description="This action cannot be undone. The pet profile will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export function MyPetCard({ pet, onDeleted }: MyPetCardProps) {
  const detailsHref = getPetDetailsRoute(pet.id);

  return (
    <>
      <article className="relative sm:hidden">
        <Link
          href={detailsHref}
          className="relative flex min-h-[122px] w-full items-end justify-between gap-5 rounded-[14px] bg-white px-6 py-5 pr-14 shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none sm:border sm:border-[#d0d0d0]"
        >
        <span className="relative shrink-0">
            {pet.imageFileId ? (
              <PrivateImage
                fileId={pet.imageFileId}
                alt={pet.description ?? `${pet.name} pet profile photo`}
                className="h-full w-full object-cover"
              />
            ) : pet.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pet.imageUrl}
                alt={pet.description ?? `${pet.name} pet profile photo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <PetImagePlaceholder className="h-full w-full" />
            )}
          </span>
          <span className="font-display text-right text-[1rem] leading-none font-bold text-[#1a1720]">
            {pet.name}
          </span>
        </Link>

        {pet.verificationStatus === "verified" ? (
          <Image
            src="/images/VerifyedMark.png"
            alt=""
            width={128}
            height={128}
            aria-hidden="true"
            className="pointer-events-none absolute top-[-24px] right-[-4px] z-10 w-[78px] select-none"
          />
        ) : null}
        <DeletePetButton
          pet={pet}
          onDeleted={onDeleted}
          className="absolute right-3 bottom-4 z-20 h-8 w-8 bg-white/90"
        />
      </article>

      <article className="relative hidden w-full max-w-[360px] rounded-[18px] border border-[#1a202c] bg-white p-6 shadow-[0_4px_4px_rgba(0,0,0,0.25)] sm:block">
        <div className="aspect-[312/364] overflow-hidden rounded-[14px]">
          {pet.imageFileId ? (
            <PrivateImage
              fileId={pet.imageFileId}
              alt={pet.description ?? `${pet.name} pet profile photo`}
              className="h-full w-full object-cover"
            />
          ) : pet.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pet.imageUrl}
              alt={pet.description ?? `${pet.name} pet profile photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <PetImagePlaceholder className="h-full w-full" />
          )}
        </div>

        {pet.verificationStatus === "verified" ? (
          <Image
            src="/images/VerifyedMark.png"
            alt=""
            width={128}
            height={128}
            aria-hidden="true"
            className="pointer-events-none absolute top-[-20px] right-[-12px] z-10 w-[104px] select-none sm:w-[118px]"
          />
        ) : null}

        <div className="space-y-7 pt-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[1.25rem] leading-none font-bold tracking-[-0.03em] text-[#010101]">
              {pet.name}
            </h2>
            <DeletePetButton pet={pet} onDeleted={onDeleted} />
          </div>

          <Link
            href={detailsHref}
            className="font-display inline-flex min-h-[62px] w-full items-center justify-center rounded-[14px] border border-[#1a202c] bg-[#8df86e] px-5 text-center text-[1.55rem] leading-none font-semibold text-[#010101] transition hover:-translate-y-0.5 hover:bg-[#7eea60] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            More details
          </Link>
        </div>
      </article>
    </>
  );
}
