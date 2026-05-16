import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import type { Pet } from "@/types";
import { COLLECTIONS, createServerTimestamp, removeUndefined, toDate } from "@/lib/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { CreatePetInput, UpdatePetInput } from "@/features/pets/pet.types";

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase environment variables are missing. Add them before using pets.");
  }
}

function mapPet(snapshot: DocumentSnapshot<DocumentData>): Pet | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ownerId: data.ownerId ?? "",
    name: data.name ?? "",
    species: data.species ?? "",
    breed: data.breed ?? undefined,
    birthDate: data.birthDate ?? undefined,
    color: data.color ?? undefined,
    description: data.description ?? undefined,
    imageUrl: data.imageUrl ?? undefined,
    microchipId: data.microchipId ?? undefined,
    isLost: Boolean(data.isLost),
    isAdoptable: Boolean(data.isAdoptable),
    verificationStatus: data.verificationStatus === "verified" ? "verified" : "unverified",
    verifiedBy: data.verifiedBy ?? undefined,
    verifiedAt: toDate(data.verifiedAt),
    publicQrId: data.publicQrId ?? snapshot.id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function sortPetsDescending(pets: Pet[]) {
  return pets.sort((left, right) => {
    const leftTime =
      left.updatedAt?.getTime() ?? left.createdAt?.getTime() ?? Number.MIN_SAFE_INTEGER;
    const rightTime =
      right.updatedAt?.getTime() ?? right.createdAt?.getTime() ?? Number.MIN_SAFE_INTEGER;

    return rightTime - leftTime;
  });
}

export async function createPet(input: CreatePetInput) {
  assertFirebaseConfigured();

  const petRef = doc(collection(db, COLLECTIONS.pets));

  await setDoc(
    petRef,
    removeUndefined({
      ownerId: input.ownerId,
      name: input.name,
      species: input.species,
      breed: input.breed,
      birthDate: input.birthDate,
      color: input.color,
      description: input.description,
      imageUrl: input.imageUrl,
      microchipId: input.microchipId,
      isLost: input.isLost ?? false,
      isAdoptable: input.isAdoptable ?? false,
      verificationStatus: "unverified",
      publicQrId: input.publicQrId,
      createdAt: createServerTimestamp(),
      updatedAt: createServerTimestamp(),
    }),
  );

  return petRef.id;
}

export async function updatePet(petId: string, input: UpdatePetInput) {
  assertFirebaseConfigured();

  await updateDoc(
    doc(db, COLLECTIONS.pets, petId),
    removeUndefined({
      ...input,
      updatedAt: createServerTimestamp(),
    }),
  );
}

export async function deletePet(petId: string) {
  assertFirebaseConfigured();
  await deleteDoc(doc(db, COLLECTIONS.pets, petId));
}

export async function getPetById(petId: string) {
  assertFirebaseConfigured();
  const snapshot = await getDoc(doc(db, COLLECTIONS.pets, petId));
  return mapPet(snapshot);
}

export async function getPetsByOwnerId(ownerId: string) {
  assertFirebaseConfigured();

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.pets), where("ownerId", "==", ownerId)),
  );

  return sortPetsDescending(
    snapshot.docs
      .map((item) => mapPet(item))
      .filter((item): item is Pet => item !== null),
  );
}

export async function getPetByPublicQrId(publicQrId: string) {
  assertFirebaseConfigured();

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.pets), where("publicQrId", "==", publicQrId)),
  );

  const match = snapshot.docs[0];
  return match ? mapPet(match) : null;
}

export async function getLostPets() {
  assertFirebaseConfigured();

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.pets), where("isLost", "==", true)),
  );

  return sortPetsDescending(
    snapshot.docs
      .map((item) => mapPet(item))
      .filter((item): item is Pet => item !== null),
  );
}

export async function markPetAsLost(petId: string) {
  assertFirebaseConfigured();
  await updatePet(petId, { isLost: true });
}

export async function markPetAsFound(petId: string) {
  assertFirebaseConfigured();
  await updatePet(petId, { isLost: false });
}

export async function verifyPet(petId: string, verifierId: string) {
  assertFirebaseConfigured();

  await updateDoc(doc(db, COLLECTIONS.pets, petId), {
    verificationStatus: "verified",
    verifiedBy: verifierId,
    verifiedAt: createServerTimestamp(),
    updatedAt: createServerTimestamp(),
  });
}
