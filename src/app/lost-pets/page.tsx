"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Pet } from "@/types";
import { getPublicPetRoute } from "@/constants/routes";
import { getLostPets } from "@/features/pets/pet.service";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PetStatusBadge } from "@/components/pet/PetStatusBadge";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

export default function LostPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadLostPets() {
      try {
        setError(null);
        const result = await getLostPets();
        if (isMounted) {
          setPets(result);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "We could not load lost pets right now.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadLostPets();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSpecies =
        speciesFilter === "all" ||
        pet.species.toLowerCase() === speciesFilter.toLowerCase();

      return matchesSpecies;
    });
  }, [pets, speciesFilter]);

  const speciesOptions = useMemo(() => {
    return Array.from(new Set(pets.map((pet) => pet.species))).sort();
  }, [pets]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Public rescue board
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Lost pets
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          This page reads public lost-pet data straight from Firestore for the MVP.
          City filtering is a placeholder until lost reports are fully joined into the board.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[0.7fr_0.7fr_1fr]">
        <Select
          label="Species"
          value={speciesFilter}
          onChange={(event) => setSpeciesFilter(event.target.value)}
        >
          <option value="all">All species</option>
          {speciesOptions.map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </Select>
        <Input
          label="City"
          value={cityFilter}
          placeholder="Placeholder filter"
          onChange={(event) => setCityFilter(event.target.value)}
          hint="Hook this up to lost report data in the next milestone."
          disabled
        />
      </section>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner label="Loading lost pets..." />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : filteredPets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No active lost pets</CardTitle>
            <CardDescription>
              This is a good empty state to keep while the rescue board is quiet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="h-full">
              <CardHeader>
                <CardTitle>{pet.name}</CardTitle>
                <CardDescription>
                  {pet.species}
                  {pet.breed ? ` - ${pet.breed}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PetStatusBadge
                  isLost={pet.isLost}
                  verificationStatus={pet.verificationStatus}
                />
                <p className="text-sm leading-6 text-muted">
                  {pet.description || "No public rescue notes have been added yet."}
                </p>
                <Link
                  href={getPublicPetRoute(pet.publicQrId)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Open public page
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </section>
  );
}
