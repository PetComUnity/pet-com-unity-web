"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { AdoptionSearchForm } from "@/components/AdoptionSearchForm";
import type { AdoptionSearchFilters } from "@/features/pets/adoption-search";
import { cn } from "@/lib/utils";

type HeroProps = {
  eyebrow?: string;
  title?: string;
  titleClassName?: string;
  description?: string;
  descriptionClassName?: string;
  sideContent?: ReactNode;
  searchFilters?: AdoptionSearchFilters;
  isSearching?: boolean;
  onSearch?: (filters: AdoptionSearchFilters) => void;
};

const defaultTitleClassName =
  "mb-20 text-[clamp(1rem,7.5vw,5.4rem)] leading-[0.88] font-semibold tracking-[-0.07em] text-[#17243b] sm:mb-0 sm:max-w-none md:mb-10";

const defaultDescriptionClassName =
  "w-full text-center text-[clamp(1.5rem,3.5vw,4rem)] leading-[1.08] tracking-[-0.03em] text-[#17243b] lg:text-left";

export function Hero({
  eyebrow,
  title,
  titleClassName,
  description,
  descriptionClassName,
  searchFilters,
  isSearching,
  onSearch,
}: HeroProps) {
  return (
    <section className="font-display relative isolate overflow-hidden bg-[#ef9322]">
      <Image
        src="/images/background.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        sizes="100vw"
        className="object-cover object-[54%_center] sm:object-[39%_center] lg:object-[10%_center]"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-[1440px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 lg:px-16 lg:py-16 xl:grid-cols-[minmax(0,48rem)_22.5rem] xl:justify-center xl:gap-6">
        <div className="text-center sm:mr-auto sm:pt-4 md:text-left lg:pt-0">
          <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-6">
            {eyebrow ? (
              <p className="text-[clamp(1.5rem,4vw,3rem)] leading-[0.95] font-semibold text-[#17243b] md:text-[clamp(3rem,6vw,4.5rem)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h1 className={cn(defaultTitleClassName, titleClassName)}>
                {title}
              </h1>
            ) : null}
            {description ? (
              <div
                className={cn(
                  defaultDescriptionClassName,
                  descriptionClassName,
                )}
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <AdoptionSearchForm
            className="max-w-[21.75rem] sm:max-w-[22.5rem] lg:mx-0 lg:w-[22.5rem]"
            filters={searchFilters}
            isSearching={isSearching}
            onSearch={onSearch}
          />
        </div>
      </div>
    </section>
  );
}
