"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Pet } from "@/types";
import { getPetDetailsRoute } from "@/constants/routes";
import { getPetById, updatePet } from "@/features/pets/pet.service";
import { toPetPayload } from "@/features/pets/pet.utils";
import { useAuth } from "@/hooks/useAuth";
import { uploadPetImage } from "@/lib/storage";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PetForm } from "@/components/pet/PetForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export default function EditPetPage() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const { appUser } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const petId = Array.isArray(params.petId) ? params.petId[0] : params.petId;

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

  return (
    <ProtectedRoute>
      <AppShell
        title={pet ? `Edit ${pet.name}` : "Edit pet"}
        description="Refine the pet profile without rebuilding its QR identity."
      >
        {saveError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-danger text-sm">{saveError}</p>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner label="Loading pet form..." />
          </div>
        ) : loadError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-danger text-sm">{loadError}</p>
            </CardContent>
          </Card>
        ) : !pet ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted text-sm">We could not find this pet.</p>
            </CardContent>
          </Card>
        ) : appUser && pet.ownerId !== appUser.id ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-danger text-sm">
                This pet profile belongs to another account.
              </p>
            </CardContent>
          </Card>
        ) : (
          <PetForm
            initialImageUrl={pet.imageUrl}
            initialValues={{
              name: pet.name,
              species: pet.species,
              breed: pet.breed,
              birthDate: pet.birthDate,
              color: pet.color,
              description: pet.description,
              microchipId: pet.microchipId,
              isAdoptable: pet.isAdoptable,
            }}
            submitLabel="Save changes"
            busy={saving}
            onSubmit={async (values, imageFile) => {
              if (!appUser) {
                throw new Error(
                  "Your account profile is not ready yet. Refresh and try again.",
                );
              }

              setSaveError(null);
              setSaving(true);

              try {
                await updatePet(pet.id, toPetPayload(values));

                if (imageFile) {
                  try {
                    const imageUrl = await uploadPetImage(
                      imageFile,
                      appUser.id,
                      pet.id,
                    );
                    await updatePet(pet.id, { imageUrl });
                  } catch {
                    setSaveError(
                      "The profile was updated, but the new image upload failed. Please try again.",
                    );
                    return;
                  }
                }

                router.replace(getPetDetailsRoute(pet.id));
              } finally {
                setSaving(false);
              }
            }}
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
