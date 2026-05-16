"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Pet } from "@/types";
import { getPetByPublicQrId } from "@/features/pets/pet.service";
import { formatDate } from "@/lib/utils";
import { PetStatusBadge } from "@/components/pet/PetStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function PublicPetPage() {
  const params = useParams<{ publicQrId: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publicQrId = Array.isArray(params.publicQrId)
    ? params.publicQrId[0]
    : params.publicQrId;

  useEffect(() => {
    let isMounted = true;

    async function loadPet() {
      try {
        setError(null);
        const result = await getPetByPublicQrId(publicQrId);
        if (isMounted) {
          setPet(result);
        }
      } catch (nextError) {
        if (isMounted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "We could not load this public pet page.",
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
  }, [publicQrId]);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="Opening public profile..." />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-danger">{error}</p>
          </CardContent>
        </Card>
      ) : !pet ? (
        <Card>
          <CardHeader>
            <CardTitle>Pet not found</CardTitle>
            <CardDescription>
              The QR code might be outdated or the record may no longer be public.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{pet.name}</CardTitle>
              <CardDescription>
                Public AnimalID profile for QR scans
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
                  <dd>{pet.breed || "Not listed"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Color</dt>
                  <dd>{pet.color || "Not listed"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Registered</dt>
                  <dd>{formatDate(pet.createdAt)}</dd>
                </div>
              </dl>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Public notes</p>
                <p className="text-sm leading-6 text-muted">
                  {pet.description || "No public notes are attached to this profile."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photo</CardTitle>
              <CardDescription>
                Public-safe image access is enabled for the MVP starter.
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
                  No image available
                </div>
              )}
            </CardContent>
          </Card>

          {pet.isLost ? (
            <Card>
              <CardHeader>
                <CardTitle>Contact section</CardTitle>
                <CardDescription>
                  This starter keeps owner contact private by default.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted">
                  Add a dedicated public rescue phone number or inbox field before
                  shipping this flow beyond the MVP. The UI is ready for that next layer.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </section>
  );
}
