import {
  Timestamp,
  serverTimestamp,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

export const COLLECTIONS = {
  users: "users",
  pets: "pets",
  lostReports: "lostReports",
} as const;

type SnapshotLike =
  | DocumentSnapshot<DocumentData>
  | QueryDocumentSnapshot<DocumentData>;

export function createServerTimestamp() {
  return serverTimestamp();
}

export function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}

export function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}

export function withDocId<T extends Record<string, unknown>>(snapshot: SnapshotLike) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as T & { id: string };
}
