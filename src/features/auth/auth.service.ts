import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AppUser, UserRole } from "@/types";
import { COLLECTIONS, createServerTimestamp, removeUndefined, toDate } from "@/lib/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import type { LoginFormValues, RegisterFormValues } from "@/features/auth/auth.types";

type CreateUserProfileInput = {
  uid: string;
  email: string;
  name: string;
  role?: UserRole;
  phone?: string;
  city?: string;
};

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase environment variables are missing. Add them before using authentication.",
    );
  }
}

function mapUserProfile(snapshot: Awaited<ReturnType<typeof getDoc>>): AppUser | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Record<string, unknown>;
  const role =
    data.role === "vet" || data.role === "admin" || data.role === "owner"
      ? data.role
      : "owner";

  return {
    uid: snapshot.id,
    email: typeof data.email === "string" ? data.email : "",
    role,
    name: typeof data.name === "string" ? data.name : "",
    phone: typeof data.phone === "string" ? data.phone : undefined,
    city: typeof data.city === "string" ? data.city : undefined,
    createdAt: toDate(data.createdAt),
  };
}

export async function createUserProfile({
  uid,
  email,
  name,
  role = "owner",
  phone,
  city,
}: CreateUserProfileInput) {
  assertFirebaseConfigured();

  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    removeUndefined({
      uid,
      email,
      role,
      name,
      phone,
      city,
      createdAt: createServerTimestamp(),
    }),
    { merge: true },
  );
}

export async function registerUser(values: RegisterFormValues) {
  assertFirebaseConfigured();

  const credential = await createUserWithEmailAndPassword(
    auth,
    values.email,
    values.password,
  );

  await updateProfile(credential.user, {
    displayName: values.name,
  });

  await createUserProfile({
    uid: credential.user.uid,
    email: values.email,
    name: values.name,
    role: "owner",
  });

  return credential.user;
}

export async function loginUser(values: LoginFormValues) {
  assertFirebaseConfigured();
  return signInWithEmailAndPassword(auth, values.email, values.password);
}

export async function logoutUser() {
  assertFirebaseConfigured();
  return signOut(auth);
}

export async function getUserProfile(uid: string) {
  assertFirebaseConfigured();
  const snapshot = await getDoc(doc(db, COLLECTIONS.users, uid));
  return mapUserProfile(snapshot);
}
