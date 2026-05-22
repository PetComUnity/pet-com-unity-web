"use client";

import { useEffect, useState } from "react";
import { getPetDetailsRoute } from "@/constants/routes";
import { getAdoptablePets } from "@/features/pets/pet-api.service";
import { AdoptionPetCard, type AdoptionPetCardData } from "@/components/pet/AdoptionPetCard";
import { Spinner } from "@/components/ui/Spinner";
import type { Pet } from "@/types";

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

export function AvailablePetsList() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAdoptablePets() {
      try {
        setErrorMessage(null);
        const result = await getAdoptablePets();

        if (isMounted) {
          setPets(result);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "We could not load adoptable pets right now.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadAdoptablePets();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <div className="grid justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <AdoptionPetCard key={pet.id} pet={toAdoptionPetCardData(pet)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
