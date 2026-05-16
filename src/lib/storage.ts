import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { isFirebaseConfigured, storage } from "@/lib/firebase";

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase environment variables are missing. Add them before uploading pet images.",
    );
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

export async function uploadPetImage(file: File, userId: string, petId: string) {
  assertFirebaseConfigured();

  const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const imageRef = ref(storage, `pet-images/${userId}/${petId}/${safeName}`);

  await uploadBytes(imageRef, file, {
    contentType: file.type || "image/jpeg",
  });

  return getDownloadURL(imageRef);
}
