"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPetDetailsRoute } from "@/constants/routes";
import { createPet, updatePet } from "@/features/pets/pet.service";
import { createPublicQrId, toPetPayload } from "@/features/pets/pet.utils";
import { useAuth } from "@/hooks/useAuth";
import { uploadPetImage } from "@/lib/storage";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PetForm } from "@/components/pet/PetForm";
import { Card, CardContent } from "@/components/ui/Card";

export default function NewPetPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [pageError, setPageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <ProtectedRoute>
      <AppShell
        title="Add a pet"
        description="Start the record with the essentials. Verification and richer workflows can layer onto the same profile."
      >
        {pageError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-danger">{pageError}</p>
            </CardContent>
          </Card>
        ) : null}

        <PetForm
          submitLabel="Create pet"
          busy={saving}
          onSubmit={async (values, imageFile) => {
            if (!appUser) {
              throw new Error("Your account profile is not ready yet. Refresh and try again.");
            }

            setPageError(null);
            setSaving(true);

            try {
              const publicQrId = createPublicQrId(values.name);
              const petId = await createPet({
                ownerId: appUser.uid,
                publicQrId,
                isLost: false,
                ...toPetPayload(values),
              });

              if (imageFile) {
                try {
                  const imageUrl = await uploadPetImage(imageFile, appUser.uid, petId);
                  await updatePet(petId, { imageUrl });
                } catch {
                  router.replace(`${getPetDetailsRoute(petId)}?notice=image-upload-failed`);
                  return;
                }
              }

              router.replace(getPetDetailsRoute(petId));
            } catch (error) {
              setPageError(
                error instanceof Error ? error.message : "We could not create this pet.",
              );
            } finally {
              setSaving(false);
            }
          }}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
