import { Hero } from "@/components/Hero";

const aboutHeroDescription =
  "We believe every pet deserves a safe, loving home and proper lifelong care. Our platform was created to make pet adoption easier, more transparent, and more connected for everyone involved - adopters, pet owners, shelters, and veterinary clinics.";

export default function AboutUsPage() {
  return (
    <Hero
      title="About Pet.com.Unity"
      titleClassName="text-[2.25rem]"
      description={aboutHeroDescription}
      descriptionClassName="w-full text-center text-[2.5rem] leading-8 tracking-normal text-[#17243b] hidden lg:block lg:text-left"
    />
  );
}
