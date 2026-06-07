import Image from "next/image";
import Link from "next/link";
import { Heart, PawPrint } from "lucide-react";
import { PrivateImage } from "@/components/common/PrivateImage";
import { cn } from "@/lib/utils";
import type { PetVerificationStatus } from "@/types";

export type AdoptionPetCardData = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  imageSrc?: string;
  imageFileId?: string;
  imageAlt?: string;
  location?: string;
  verificationStatus: PetVerificationStatus;
  detailsHref: string;
};

function formatBirthDate(birthDate?: string) {
  if (!birthDate) {
    return "Not specified";
  }

  const parsedDate = new Date(birthDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return birthDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(parsedDate);
}

export function AdoptionPetCard({
  pet,
  className,
}: {
  pet: AdoptionPetCardData;
  className?: string;
}) {
  const imageAlt = pet.imageAlt ?? `${pet.name} waiting for adoption`;

  return (
    <article
      className={cn(
        "w-full max-w-[22.5rem] rounded-[1rem] border border-[#364153] bg-[#fff] p-5 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      <div className="relative aspect-[312/336] overflow-hidden rounded-[1rem] bg-[#f0ebe4]">
        {pet.imageFileId || !pet.imageSrc ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <PawPrint className="h-1/3 w-1/3 text-[#c9b99a]" />
          </div>
        ) : null}

        {pet.imageFileId ? (
          <PrivateImage
            fileId={pet.imageFileId}
            alt={imageAlt}
            allowUnauthenticated
            className="relative h-full w-full object-cover"
          />
        ) : pet.imageSrc ? (
          <Image
            src={pet.imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) calc(100vw - 3rem), 320px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="space-y-6 px-2 pt-6 pb-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[1.25rem] leading-none font-bold tracking-[-0.04em] text-[#263043]">
            {pet.name}
          </h2>
          <span
            className="flex h-10 w-10 items-center justify-center text-[#263043]"
            aria-hidden="true"
          >
            <Heart className="h-5 w-5" />
          </span>
        </div>

        <dl className="space-y-3.5 text-[0.875rem] leading-[1.4] text-[#263043]">
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold">Location:</dt>
            <dd>{pet.location ?? "Not specified"}</dd>
          </div>
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold">Species:</dt>
            <dd>{pet.species}</dd>
          </div>
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold">Breed:</dt>
            <dd>{pet.breed ?? "Not specified"}</dd>
          </div>
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold">Birth date:</dt>
            <dd>{formatBirthDate(pet.birthDate)}</dd>
          </div>
        </dl>

        <Link
          href={pet.detailsHref}
          className="inline-flex h-[3.9rem] w-full items-center justify-center rounded-[1.25rem] border border-[#364153] bg-[#8df86e] px-5 font-display text-[1.5rem] text-bold leading-none text-[#17243b] transition hover:bg-[#7ae55e] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#364153]/25 focus-visible:ring-offset-2"
        >
          More details
        </Link>
      </div>
    </article>
  );
}
