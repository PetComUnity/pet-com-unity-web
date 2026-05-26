"use client";

import { useState } from "react";
import { Hero } from "@/components/Hero";
import { AvailablePetsList } from "@/components/pet/AvailablePetsList";
import { DEFAULT_ADOPTION_SEARCH_FILTERS } from "@/features/pets/adoption-search";

export default function HomePage() {
  const [filters, setFilters] = useState(DEFAULT_ADOPTION_SEARCH_FILTERS);

  return (
    <>
      <Hero
        eyebrow="Welcome to"
        title="Pet.com.Unity"
        description="Find your perfect companion from loving shelters across the country"
        searchFilters={filters}
        onSearch={setFilters}
      />
      <AvailablePetsList filters={filters} />
    </>
  );
}
