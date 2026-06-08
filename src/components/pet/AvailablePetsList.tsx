"use client";

import { useEffect, useRef, useState } from "react";
import { getPetDetailsRoute } from "@/constants/routes";
import { getAllAdoptablePets } from "@/features/pets/pet-api.service";
import {
  getPetSizeFromWeight,
  type AdoptionSearchFilters,
} from "@/features/pets/adoption-search";
import {
  AdoptionPetCard,
  type AdoptionPetCardData,
} from "@/components/pet/AdoptionPetCard";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import type { Pet } from "@/types";

const PETS_PER_PAGE = 6;

function toAdoptionPetCardData(pet: Pet): AdoptionPetCardData {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birthDate: pet.birthDate,
    location: pet.location,
    imageSrc: pet.imageUrl,
    imageFileId: pet.imageFileId,
    imageAlt:
      pet.description ?? `${pet.name} the ${pet.species} waiting for adoption`,
    verificationStatus: pet.verificationStatus,
    detailsHref: getPetDetailsRoute(pet.id),
  };
}

export function AvailablePetsList({
  filters,
  searchToken,
  sectionId,
  onSearchSettled,
}: {
  filters: AdoptionSearchFilters;
  searchToken?: number;
  sectionId?: string;
  onSearchSettled?: (searchToken: number) => void;
}) {
  const activeSearchKey = `${searchToken ?? 0}:${filters.animal}:${filters.size}:${filters.location}`;
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestFiltersRef = useRef(filters);
  const settledSearchTokenRef = useRef(0);
  const [paginationState, setPaginationState] = useState(() => ({
    activeSearchKey,
    page: 1,
  }));

  useEffect(() => {
    latestFiltersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadAdoptablePets() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const result = await getAllAdoptablePets(
          latestFiltersRef.current,
          50,
          abortController.signal,
        );

        setPets(result);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We could not load adoptable pets right now.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAdoptablePets();

    return () => {
      abortController.abort();
    };
  }, [activeSearchKey]);

  useEffect(() => {
    if (
      loading ||
      typeof searchToken !== "number" ||
      searchToken < 1 ||
      settledSearchTokenRef.current === searchToken
    ) {
      return;
    }

    settledSearchTokenRef.current = searchToken;
    onSearchSettled?.(searchToken);
  }, [loading, onSearchSettled, searchToken]);

  const normalizedLocationFilter = filters.location.trim().toLowerCase();

  const filteredPets = pets.filter((pet) => {
    const matchesAnimal =
      filters.animal === "" ||
      pet.species.trim().toLowerCase() === filters.animal;
    const matchesSize =
      filters.size === "" || getPetSizeFromWeight(pet.weight) === filters.size;
    const matchesLocation =
      normalizedLocationFilter === "" ||
      pet.location?.trim().toLowerCase().includes(normalizedLocationFilter) ===
        true;

    return matchesAnimal && matchesSize && matchesLocation;
  });

  const totalPages = Math.ceil(filteredPets.length / PETS_PER_PAGE);
  const currentPage =
    paginationState.activeSearchKey === activeSearchKey
      ? paginationState.page
      : 1;
  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const pageStartIndex = (safeCurrentPage - 1) * PETS_PER_PAGE;
  const visiblePets = filteredPets.slice(
    pageStartIndex,
    pageStartIndex + PETS_PER_PAGE,
  );
  const hasActiveFilters =
    filters.animal !== "" ||
    filters.size !== "" ||
    normalizedLocationFilter !== "";

  function setPage(page: number) {
    setPaginationState({
      activeSearchKey,
      page,
    });
  }

  return (
    <section
      id={sectionId}
      className="scroll-mt-24 bg-[#fff8f0] px-5 py-14 sm:px-8 lg:px-16 lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
        <div className="max-w-[42rem] space-y-3 p-5 text-[#17243b]">
          <p className="font-display text-semibold text-[3rem] leading-none tracking-[-0.04em] text-[#1a202c]">
            Available Pets
          </p>
          <p className="max-w-[34rem] text-base leading-7 text-[#7A7878] sm:text-[1.1rem]">
            Sign in to start the adoption process
          </p>
        </div>

        {loading ? (
          <div className="rounded-[1rem] border border-[#364153] bg-white px-6 py-8 text-[#263043] shadow-[0_4px_4px_0_rgba(0,0,0,0.15)]">
            <Spinner label="Loading adoptable pets..." />
          </div>
        ) : errorMessage ? (
          <div className="rounded-[1rem] border border-[#364153] bg-white px-6 py-8 text-[#263043] shadow-[0_4px_4px_0_rgba(0,0,0,0.15)]">
            {errorMessage}
          </div>
        ) : pets.length === 0 ? (
          <div className="rounded-[1rem] border border-[#364153] bg-white px-6 py-8 text-[#263043] shadow-[0_4px_4px_0_rgba(0,0,0,0.15)]">
            No pets are currently listed for adoption. Please check back soon.
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="rounded-[1rem] border border-[#364153] bg-white px-6 py-8 text-[#263043] shadow-[0_4px_4px_0_rgba(0,0,0,0.15)]">
            {hasActiveFilters
              ? "No adoptable pets match the selected filters."
              : "No pets are currently listed for adoption. Please check back soon."}
          </div>
        ) : (
          <>
            <div className="grid justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visiblePets.map((pet) => (
                <AdoptionPetCard
                  key={pet.id}
                  pet={toAdoptionPetCardData(pet)}
                />
              ))}
            </div>

            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              ariaLabel="Adoptable pets pagination"
            />
          </>
        )}
      </div>
    </section>
  );
}
