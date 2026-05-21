import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdoptionPetCardData = {
  name: string;
  location: string;
  size: string;
  weightKg: number;
  ageLabel: string;
  imageSrc: string;
  imageAlt: string;
  detailsHref: string;
};

export function AdoptionPetCard({
  pet,
  className,
}: {
  pet: AdoptionPetCardData;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "w-full max-w-[22.5rem] rounded-[1rem] border border-[#364153] bg-[#fff] p-5 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      <div className="relative aspect-[312/336] overflow-hidden rounded-[1rem]">
        <Image
          src={pet.imageSrc}
          alt={pet.imageAlt}
          fill
          sizes="(max-width: 640px) calc(100vw - 3rem), 320px"
          className="object-cover"
        />
      </div>

      <div className="space-y-6 px-2 pt-6 pb-2">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[2.1rem] leading-none font-semibold tracking-[-0.04em] text-[#263043]">
            {pet.name}
          </h2>
          <span
            className="flex h-10 w-10 items-center justify-center text-[#263043]"
            aria-hidden="true"
          >
            <Heart className="h-5 w-5" />
          </span>
        </div>

        <dl className="space-y-3.5 text-[1.12rem] leading-[1.4] text-[#263043]">
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold">Location:</dt>
            <dd>{pet.location}</dd>
          </div>
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold">Size:</dt>
            <dd>
              {pet.size} ({pet.weightKg} kg)
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold">Age:</dt>
            <dd>{pet.ageLabel}</dd>
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
