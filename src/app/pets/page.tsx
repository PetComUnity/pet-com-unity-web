"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Pet } from "@/types";
import { ROUTES } from "@/constants/routes";
import { getPetsByOwnerId } from "@/features/pets/pet.service";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PetCard } from "@/components/pet/PetCard";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function PetsPage() {
  const { appUser } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPets() {
      if (!appUser) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const result = await getPetsByOwnerId(appUser.id);
        if (isMounted) {
          setPets(result);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "We could not load your pets right now.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPets();

    return () => {
      isMounted = false;
    };
  }, [appUser]);

  return (
    <ProtectedRoute>
      <AppShell
        title="My pets"
        description="Each pet profile becomes the source of truth for QR lookups, lost status, and verification."
        actions={
          <Link
            href={ROUTES.newPet}
            className={buttonVariants({ variant: "primary" })}
          >
            Add pet
          </Link>
        }
      >
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner label="Loading pet profiles..." />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-danger text-sm">{error}</p>
            </CardContent>
          </Card>
        ) : pets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No pets yet</CardTitle>
              <CardDescription>
                Create your first profile to test the QR, public page, and lost
                or found flow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={ROUTES.newPet}
                className={buttonVariants({ variant: "primary" })}
              >
                Create your first pet
              </Link>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </section>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
