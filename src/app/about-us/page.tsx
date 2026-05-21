import { Hero } from "@/components/Hero";

const aboutHeroDescription =
  "We believe every pet deserves a safe, loving home and proper lifelong care. Our platform was created to make pet adoption easier, more transparent, and more connected for everyone involved - adopters, pet owners, shelters, and veterinary clinics.";

export default function AboutUsPage() {
  return (
    <Hero
      title="About Pet.com.Unity"
      titleClassName="text-[2.25rem]"
      description={aboutHeroDescription}
      descriptionClassName="w-full max-w-[41rem] text-center text-[1.2rem] leading-8 tracking-normal text-[#17243b] sm:text-[1.35rem] lg:text-left lg:text-[1.55rem]"
    />
  );
}
