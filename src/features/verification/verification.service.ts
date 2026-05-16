import { collection, getDocs, query, where } from "firebase/firestore";
import type { Pet } from "@/types";
import { COLLECTIONS, toDate } from "@/lib/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { verifyPet } from "@/features/pets/pet.service";

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase environment variables are missing. Add them before using verification.",
    );
  }
}

function mapUnverifiedPet(id: string, data: Record<string, unknown>): Pet {
  return {
    id,
    ownerId: String(data.ownerId ?? ""),
    name: String(data.name ?? ""),
    species: String(data.species ?? ""),
    breed: (data.breed as string | undefined) ?? undefined,
    birthDate: (data.birthDate as string | undefined) ?? undefined,
    color: (data.color as string | undefined) ?? undefined,
    description: (data.description as string | undefined) ?? undefined,
    imageUrl: (data.imageUrl as string | undefined) ?? undefined,
    microchipId: (data.microchipId as string | undefined) ?? undefined,
    isLost: Boolean(data.isLost),
    isAdoptable: Boolean(data.isAdoptable),
    verificationStatus: data.verificationStatus === "verified" ? "verified" : "unverified",
    verifiedBy: (data.verifiedBy as string | undefined) ?? undefined,
    verifiedAt: toDate(data.verifiedAt),
    publicQrId: String(data.publicQrId ?? ""),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getUnverifiedPets() {
  assertFirebaseConfigured();

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.pets), where("verificationStatus", "==", "unverified")),
  );

  return snapshot.docs.map((item) => mapUnverifiedPet(item.id, item.data()));
}

export async function approvePetVerification(petId: string, verifierId: string) {
  assertFirebaseConfigured();
  await verifyPet(petId, verifierId);
}
