"use client";

import { useRef, useState } from "react";
import { Hero } from "@/components/Hero";
import { AvailablePetsList } from "@/components/pet/AvailablePetsList";
import {
  DEFAULT_ADOPTION_SEARCH_FILTERS,
  type AdoptionSearchFilters,
} from "@/features/pets/adoption-search";

const ADOPTABLE_RESULTS_SECTION_ID = "adoptable-pets-results";

export default function HomePage() {
  const [filters, setFilters] = useState(DEFAULT_ADOPTION_SEARCH_FILTERS);
  const [searchToken, setSearchToken] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const latestSearchTokenRef = useRef(0);

  function handleSearch(nextFilters: AdoptionSearchFilters) {
    const nextSearchToken = latestSearchTokenRef.current + 1;

    latestSearchTokenRef.current = nextSearchToken;
    setFilters(nextFilters);
    setSearchToken(nextSearchToken);
    setIsSearching(true);
  }

  function handleSearchSettled(completedSearchToken: number) {
    if (completedSearchToken !== latestSearchTokenRef.current) {
      return;
    }

    setIsSearching(false);

    window.requestAnimationFrame(() => {
      document
        .getElementById(ADOPTABLE_RESULTS_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <Hero
        eyebrow="Welcome to"
        title="Pet.com.Unity"
        description="Find your perfect companion from loving shelters across the country"
        searchFilters={filters}
        isSearching={isSearching}
        onSearch={handleSearch}
      />
      <AvailablePetsList
        filters={filters}
        searchToken={searchToken}
        sectionId={ADOPTABLE_RESULTS_SECTION_ID}
        onSearchSettled={handleSearchSettled}
      />
    </>
  );
}
