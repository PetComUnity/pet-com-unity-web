import { Hero } from "@/components/Hero";
import { AvailablePetsList } from "@/components/pet/AvailablePetsList";

export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow="Welcome to"
        title="Pet.com.Unity"
        description="Find your perfect companion from loving shelters across the country"
      />
      <AvailablePetsList />
    </>
  );
}
