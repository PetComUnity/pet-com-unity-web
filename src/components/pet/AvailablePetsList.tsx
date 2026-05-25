"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPetDetailsRoute } from "@/constants/routes";
import {
  getAdoptablePets,
  type PaginationMeta,
} from "@/features/pets/pet-api.service";
import { AdoptionPetCard, type AdoptionPetCardData } from "@/components/pet/AdoptionPetCard";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

const PETS_PER_PAGE = 6;
const MAX_VISIBLE_PAGE_BUTTONS = 5;
const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: PETS_PER_PAGE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function toAdoptionPetCardData(pet: Pet): AdoptionPetCardData {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birthDate: pet.birthDate,
    imageSrc: pet.imageUrl,
    imageAlt: pet.description ?? `${pet.name} the ${pet.species} waiting for adoption`,
    verificationStatus: pet.verificationStatus,
    detailsHref: getPetDetailsRoute(pet.id),
  };
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages < 1) {
    return [];
  }

  const visibleCount = Math.min(MAX_VISIBLE_PAGE_BUTTONS, totalPages);
  const halfWindow = Math.floor(visibleCount / 2);

  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = startPage + visibleCount - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - visibleCount + 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );
}

export function AvailablePetsList() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);

  useEffect(() => {
    let isActive = true;

    async function loadAdoptablePets() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const result = await getAdoptablePets(currentPage, PETS_PER_PAGE);

        if (!isActive) {
          return;
        }

        if (result.meta.totalPages > 0 && currentPage > result.meta.totalPages) {
          setCurrentPage(result.meta.totalPages);
          return;
        }

        setPets(result.pets);
        setPagination(result.meta);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We could not load adoptable pets right now.",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadAdoptablePets();

    return () => {
      isActive = false;
    };
  }, [currentPage]);

  const totalPages = pagination.totalPages;
  const visiblePets = pets;
  const visiblePageNumbers = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <section className="bg-[#fff8f0] px-5 py-14 sm:px-8 lg:px-16 lg:py-20">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
        <div className="max-w-[42rem] p-5 space-y-3 text-[#17243b]">
          <p className="font-display text-[3rem] text-semibold leading-none tracking-[-0.04em] text-[#1a202c]">
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
        ) : (
          <>
            <div className="grid justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visiblePets.map((pet) => (
                <AdoptionPetCard key={pet.id} pet={toAdoptionPetCardData(pet)} />
              ))}
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Adoptable pets pagination"
                className="flex items-center justify-center gap-2.5 pt-2"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={!pagination.hasPreviousPage}
                  aria-label="Go to previous page"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-[#17243b] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17243b]/25 focus-visible:ring-offset-2",
                    !pagination.hasPreviousPage
                      ? "cursor-not-allowed opacity-35"
                      : "hover:-translate-x-0.5 hover:text-[#0f1728]",
                  )}
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
                </button>

                {visiblePageNumbers.map((pageNumber) => {
                  const isActive = pageNumber === currentPage;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium text-[#17243b] shadow-[0_2px_4px_rgba(23,36,59,0.1)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17243b]/25 focus-visible:ring-offset-2",
                        isActive
                          ? "border-[#ef9322] bg-[#ef9322] text-[#17243b]"
                          : "border-[#d4d8de] bg-white hover:-translate-y-0.5 hover:border-[#17243b]",
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={!pagination.hasNextPage}
                  aria-label="Go to next page"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-[#17243b] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17243b]/25 focus-visible:ring-offset-2",
                    !pagination.hasNextPage
                      ? "cursor-not-allowed opacity-35"
                      : "hover:translate-x-0.5 hover:text-[#0f1728]",
                  )}
                >
                  <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
