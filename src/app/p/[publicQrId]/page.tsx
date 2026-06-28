"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PublicPet } from "@/types";
import { getPetByPublicQrId } from "@/features/pets/pet-api.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { VerificationStatusBadge } from "@/components/verification/VerificationStatusBadge";

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

function getPublicText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not listed";
}

function formatBirthDate(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "Not listed";
  }

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = isoDateMatch
    ? new Date(
        Number(isoDateMatch[1]),
        Number(isoDateMatch[2]) - 1,
        Number(isoDateMatch[3]),
      )
    : new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export default function PublicPetPage() {
  const params = useParams<{ publicQrId: string }>();
  const [pet, setPet] = useState<PublicPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publicQrId = getRouteParam(params.publicQrId);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadPet() {
      if (!publicQrId) {
        setPet(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getPetByPublicQrId(
          publicQrId,
          abortController.signal,
        );
        if (!abortController.signal.aborted) {
          setPet(result);
        }
      } catch (nextError) {
        if (!abortController.signal.aborted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "We could not load this public pet page.",
          );
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPet();

    return () => {
      abortController.abort();
    };
  }, [publicQrId]);

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb] px-4 py-8 text-[#1a202c] sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="Opening public profile..." />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-danger text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : !pet ? (
        <Card>
          <CardHeader>
            <CardTitle>Pet not found</CardTitle>
            <CardDescription>
              The QR code might be outdated or the record may no longer be
              public.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card className="overflow-hidden rounded-[14px] border-[#e5d8c7]">
            {pet.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pet.imageUrl}
                alt={`${pet.name} public profile photo`}
                className="h-80 w-full object-cover lg:h-full"
              />
            ) : (
              <div className="flex h-80 items-center justify-center bg-[#f0ebe4] text-sm font-medium text-[#5f5449] lg:h-full">
                No public photo available
              </div>
            )}
          </Card>

          <Card className="rounded-[14px] border-[#e5d8c7]">
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                {pet.isLost ? (
                  <span className="rounded-full bg-[#ff5277] px-3 py-1 text-xs font-semibold text-[#1a1720]">
                    Lost
                  </span>
                ) : null}
                {pet.isAdoptable ? (
                  <span className="rounded-full bg-[#97ff7b] px-3 py-1 text-xs font-semibold text-[#1a1720]">
                    Adoptable
                  </span>
                ) : null}
                {pet.verificationStatus === "verified" ? (
                  <VerificationStatusBadge status="verified" />
                ) : null}
              </div>
              <CardTitle className="text-3xl">{pet.name}</CardTitle>
              <CardDescription>Public pet profile for QR scans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="text-muted grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-foreground font-medium">Species</dt>
                  <dd>{pet.species}</dd>
                </div>
                <div>
                  <dt className="text-foreground font-medium">Breed</dt>
                  <dd>{getPublicText(pet.breed)}</dd>
                </div>
                <div>
                  <dt className="text-foreground font-medium">Date of birth</dt>
                  <dd>{formatBirthDate(pet.birthDate)}</dd>
                </div>
                <div>
                  <dt className="text-foreground font-medium">Gender</dt>
                  <dd>{getPublicText(pet.gender)}</dd>
                </div>
                <div>
                  <dt className="text-foreground font-medium">Color</dt>
                  <dd>{getPublicText(pet.color)}</dd>
                </div>
              </dl>

              <div className="space-y-2">
                <p className="text-foreground text-sm font-medium">
                  Public description
                </p>
                <p className="text-muted text-sm leading-6">
                  {pet.description ||
                    "No public description is attached to this profile."}
                </p>
              </div>

              {pet.isLost ? (
                <div className="rounded-[12px] border border-[#ff5277]/35 bg-[#fff1f4] p-4 text-sm leading-6 text-[#5f1f2d]">
                  This pet is marked as lost. Owner contact details remain
                  private on this public page.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
