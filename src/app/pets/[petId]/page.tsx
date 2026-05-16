"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { Pet } from "@/types";
import { getPetEditRoute, getPublicPetRoute } from "@/constants/routes";
import {
  getPetById,
  markPetAsFound,
  markPetAsLost,
} from "@/features/pets/pet.service";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatDateTime } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PetQrCode } from "@/components/pet/PetQrCode";
import { PetStatusBadge } from "@/components/pet/PetStatusBadge";
import { Button, buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function PetDetailsPage() {
  const params = useParams<{ petId: string }>();
  const searchParams = useSearchParams();
  const { appUser } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingLost, setTogglingLost] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const petId = Array.isArray(params.petId) ? params.petId[0] : params.petId;
  const notice = searchParams.get("notice");

  useEffect(() => {
    let isMounted = true;

    async function loadPet() {
      try {
        setLoadError(null);
        const result = await getPetById(petId);
        if (isMounted) {
          setPet(result);
        }
      } catch (nextError) {
        if (isMounted) {
          setLoadError(
            nextError instanceof Error
              ? nextError.message
              : "We could not load this pet profile.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPet();

    return () => {
      isMounted = false;
    };
  }, [petId]);

  const publicUrl = useMemo(() => {
    if (!pet) {
      return "";
    }

    const path = getPublicPetRoute(pet.publicQrId);
    return typeof window === "undefined" ? path : `${window.location.origin}${path}`;
  }, [pet]);

  return (
    <ProtectedRoute>
      <AppShell
        title={pet?.name ?? "Pet details"}
        description="Review the profile, open the public QR page, and switch the lost or found status."
        actions={
          pet ? (
            <>
              <Link
                href={getPetEditRoute(pet.id)}
                className={buttonVariants({ variant: "outline" })}
              >
                Edit
              </Link>
              <Button
                type="button"
                variant={pet.isLost ? "secondary" : "destructive"}
                onClick={async () => {
                  if (!pet) {
                    return;
                  }

                  setTogglingLost(true);
                  setActionError(null);

                  try {
                    if (pet.isLost) {
                      await markPetAsFound(pet.id);
                      setPet({ ...pet, isLost: false });
                    } else {
                      await markPetAsLost(pet.id);
                      setPet({ ...pet, isLost: true });
                    }
                  } catch (nextError) {
                    setActionError(
                      nextError instanceof Error
                        ? nextError.message
                        : "We could not update the lost status.",
                    );
                  } finally {
                    setTogglingLost(false);
                  }
                }}
                disabled={togglingLost}
              >
                {togglingLost
                  ? "Updating..."
                  : pet.isLost
                    ? "Mark as found"
                    : "Mark as lost"}
              </Button>
            </>
          ) : undefined
        }
      >
        {notice === "image-upload-failed" ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-amber-700">
                The pet was created, but the image upload did not finish. You can retry from Edit pet.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {actionError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-danger">{actionError}</p>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner label="Loading pet details..." />
          </div>
        ) : loadError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-danger">{loadError}</p>
            </CardContent>
          </Card>
        ) : !pet ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted">We could not find this pet.</p>
            </CardContent>
          </Card>
        ) : appUser && pet.ownerId !== appUser.uid ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-danger">
                This pet profile belongs to another account.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identity</CardTitle>
                  <CardDescription>
                    Core profile data kept ready for owners, admins, and public scans.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <PetStatusBadge
                    isLost={pet.isLost}
                    verificationStatus={pet.verificationStatus}
                  />

                  <dl className="grid gap-4 text-sm text-muted sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-foreground">Species</dt>
                      <dd>{pet.species}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Breed</dt>
                      <dd>{pet.breed || "Not added"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Birth date</dt>
                      <dd>{pet.birthDate || "Not added"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Color</dt>
                      <dd>{pet.color || "Not added"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Microchip ID</dt>
                      <dd>{pet.microchipId || "Not added"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Adoptable</dt>
                      <dd>{pet.isAdoptable ? "Yes" : "No"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Created</dt>
                      <dd>{formatDate(pet.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground">Last updated</dt>
                      <dd>{formatDateTime(pet.updatedAt)}</dd>
                    </div>
                  </dl>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Description</p>
                    <p className="text-sm leading-6 text-muted">
                      {pet.description || "No description added yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Photo</CardTitle>
                  <CardDescription>
                    Firebase Storage is wired for pet image uploads.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pet.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="h-72 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 text-sm text-muted">
                      No photo uploaded yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {publicUrl ? <PetQrCode pet={pet} url={publicUrl} /> : null}
          </section>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
