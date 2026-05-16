import { addDoc, collection, getDocs, query, updateDoc, where, doc } from "firebase/firestore";
import type { LostReport } from "@/types";
import { COLLECTIONS, createServerTimestamp, removeUndefined, toDate } from "@/lib/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { LostReportFormValues } from "@/features/lost-found/lost-found.types";

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase environment variables are missing. Add them before using lost and found data.",
    );
  }
}

function mapLostReport(id: string, data: Record<string, unknown>): LostReport {
  return {
    id,
    petId: String(data.petId ?? ""),
    ownerId: String(data.ownerId ?? ""),
    city: String(data.city ?? ""),
    lastSeenLocation: (data.lastSeenLocation as string | undefined) ?? undefined,
    dateLost: (data.dateLost as string | undefined) ?? undefined,
    message: (data.message as string | undefined) ?? undefined,
    status: data.status === "resolved" ? "resolved" : "active",
    createdAt: toDate(data.createdAt),
  };
}

export async function createLostReport(
  petId: string,
  ownerId: string,
  values: LostReportFormValues,
) {
  assertFirebaseConfigured();

  const result = await addDoc(
    collection(db, COLLECTIONS.lostReports),
    removeUndefined({
      petId,
      ownerId,
      city: values.city,
      lastSeenLocation: values.lastSeenLocation,
      dateLost: values.dateLost,
      message: values.message,
      status: "active",
      createdAt: createServerTimestamp(),
    }),
  );

  return result.id;
}

export async function getLostReportsByOwnerId(ownerId: string) {
  assertFirebaseConfigured();

  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.lostReports), where("ownerId", "==", ownerId)),
  );

  return snapshot.docs.map((item) => mapLostReport(item.id, item.data()));
}

export async function getActiveLostReportsByPetId(petId: string) {
  assertFirebaseConfigured();

  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.lostReports),
      where("petId", "==", petId),
      where("status", "==", "active"),
    ),
  );

  return snapshot.docs.map((item) => mapLostReport(item.id, item.data()));
}

export async function resolveLostReport(reportId: string) {
  assertFirebaseConfigured();

  await updateDoc(doc(db, COLLECTIONS.lostReports, reportId), {
    status: "resolved",
  });
}
