import { Hero } from "@/components/Hero";

import { WhatWeDo } from "@/components/about/WhatWeDo";
import { AdoptedPets } from "@/components/about/AdoptedPets";
import { OurMission } from "@/components/about/OurMission";

const aboutHeroDescription =
  "We believe every pet deserves a safe, loving home and proper lifelong care. Our platform was created to make pet adoption easier, more transparent, and more connected for everyone involved - adopters, pet owners, shelters, and veterinary clinics.";

export default function AboutUsPage() {
  return (
    <>
      <Hero
        title="About Pet.com.Unity"
        titleClassName="text-[2.25rem]"
        description={aboutHeroDescription}
        descriptionClassName="hidden w-full text-center text-[2.5rem] leading-8 tracking-normal text-[#17243b] lg:block lg:text-left"
      />

      <main>
        <section className="bg-[#fff8ef] px-6 py-8 lg:hidden">
          <p className="mx-auto max-w-[720px] text-center font-serif text-[24px] leading-[130%] text-[#1A202C]">
            {aboutHeroDescription}
          </p>
        </section>

        <section className="bg-[#ef9322] lg:bg-[#fff8ef]">
          <WhatWeDo />
        </section>

        <section className="bg-[#fff8ef]">
          <AdoptedPets />
          <OurMission />
        </section>
      </main>

    </>

  )
}