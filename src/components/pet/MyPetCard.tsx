import Image from "next/image";
import Link from "next/link";
import { getPetDetailsRoute } from "@/constants/routes";
import type { Pet } from "@/types";

const fallbackPetImageSrc = "/images/mock-img.png";

export function MyPetCard({ pet }: { pet: Pet }) {
  const detailsHref = getPetDetailsRoute(pet.id);

  return (
    <>
      <Link
        href={detailsHref}
        className="relative flex min-h-[122px] w-full items-end justify-between gap-5 rounded-[14px] bg-white px-6 py-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none sm:hidden sm:border sm:border-[#d0d0d0]"
      >
        <span className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pet.imageUrl ?? fallbackPetImageSrc}
            alt={pet.description ?? `${pet.name} pet profile photo`}
            className="h-20 w-20 rounded-[12px] object-cover"
          />
        </span>
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
        <span className="font-display text-right text-[1rem] leading-none font-bold text-[#1a1720]">
          {pet.name}
        </span>
      </Link>

      <article className="relative hidden w-full max-w-[360px] rounded-[18px] border border-[#1a202c] bg-white p-6 shadow-[0_4px_4px_rgba(0,0,0,0.25)] sm:block">
        <div className="aspect-[312/364] overflow-hidden rounded-[14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pet.imageUrl ?? fallbackPetImageSrc}
            alt={pet.description ?? `${pet.name} pet profile photo`}
            className="h-full w-full object-cover"
          />
        </div>

        {pet.verificationStatus === "verified" ? (
          <Image
            src="/images/VerifyedMark.png"
            alt=""
            width={128}
            height={128}
            aria-hidden="true"
            className="pointer-events-none absolute top-[58%] right-2 z-10 w-[104px] select-none sm:right-1 sm:w-[118px]"
          />
        ) : null}

        <div className="space-y-7 pt-7">
          <h2 className="text-[1.25rem] leading-none font-bold tracking-[-0.03em] text-[#010101]">
            {pet.name}
          </h2>

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
