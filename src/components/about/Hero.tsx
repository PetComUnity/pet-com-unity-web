import Image from "next/image";
import { AdoptionSearchForm } from "@/components/about/AdoptionSearchForm";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#ef9322]">
      <Image
        src="/images/background.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        sizes="100vw"
        className="object-cover object-[74%_center] sm:object-[69%_center] lg:object-center"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-[1440px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 lg:px-16 lg:py-16 xl:grid-cols-[minmax(0,48rem)_22.5rem] xl:justify-center xl:gap-6">
        <div className="pt-2 text-center sm:pt-4 lg:pt-0 lg:text-left">
          <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-6">
            <p className="text-[clamp(1.35rem,4vw,3rem)] leading-[0.95] font-semibold text-[#17243b]">
              Welcome to
            </p>
            <h1 className="text-[clamp(1rem,7.5vw,5.4rem)] leading-[0.88] font-semibold tracking-[-0.07em] text-[#17243b] sm:max-w-none">
              Pet.com.Unity
            </h1>
            <p className="text-[clamp(1rem,2.65vw,1.95rem)] leading-[1.08] tracking-[-0.03em] text-[#17243b] lg:max-w-[28ch]">
              Find your perfect companion from loving shelters across the
              country
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <AdoptionSearchForm className="max-w-[21.75rem] sm:max-w-[22.5rem] lg:mx-0 lg:w-[22.5rem]" />
        </div>
      </div>
    </section>
  );
}
