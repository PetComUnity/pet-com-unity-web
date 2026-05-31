"use client";

import { useEffect, useState } from "react";
import type { Pet } from "@/types";
import { VERIFICATION_ALLOWED_ROLES } from "@/constants/roles";
import {
  approvePetVerification,
  getUnverifiedPets,
} from "@/features/verification/verification.service";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function VerificationPage() {
  const { appUser } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [verifyingPetId, setVerifyingPetId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPets() {
      try {
        setLoadError(null);
        const result = await getUnverifiedPets();
        if (isMounted) {
          setPets(result);
        }
      } catch (nextError) {
        if (isMounted) {
          setLoadError(
            nextError instanceof Error
              ? nextError.message
              : "We could not load unverified pets right now.",
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
  }, []);

  return (
    <ProtectedRoute allowedRoles={VERIFICATION_ALLOWED_ROLES}>
      <AppShell
        title="Verification queue"
        description="Vet and admin users can approve pet profiles once the record looks trustworthy."
      >
        {actionError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-danger text-sm">{actionError}</p>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner label="Loading verification queue..." />
          </div>
        ) : loadError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-danger text-sm">{loadError}</p>
            </CardContent>
          </Card>
        ) : pets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nothing waiting for review</CardTitle>
              <CardDescription>
                All current pet profiles are verified, or the queue is still
                empty.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <section className="grid gap-4">
            {pets.map((pet) => (
              <Card key={pet.id}>
                <CardHeader>
                  <CardTitle>{pet.name}</CardTitle>
                  <CardDescription>
                    {pet.species}
                    {pet.breed ? ` - ${pet.breed}` : ""} - Owner ID:{" "}
                    {pet.ownerId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <dl className="text-muted grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-foreground font-medium">Microchip</dt>
                      <dd>{pet.microchipId || "Not added"}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground font-medium">Created</dt>
                      <dd>{formatDate(pet.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground font-medium">
                        Lost status
                      </dt>
                      <dd>{pet.isLost ? "Lost" : "Safe"}</dd>
                    </div>
                  </dl>
                  <Button
                    type="button"
                    disabled={!appUser || verifyingPetId === pet.id}
                    onClick={async () => {
                      if (!appUser) {
                        return;
                      }

                      setVerifyingPetId(pet.id);
                      setActionError(null);

                      try {
                        await approvePetVerification(pet.id, appUser.id);
                        setPets((currentPets) =>
                          currentPets.filter((item) => item.id !== pet.id),
                        );
                      } catch (nextError) {
                        setActionError(
                          nextError instanceof Error
                            ? nextError.message
                            : "We could not verify this pet right now.",
                        );
                      } finally {
                        setVerifyingPetId(null);
                      }
                    }}
                  >
                    {verifyingPetId === pet.id ? "Verifying..." : "Verify pet"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
