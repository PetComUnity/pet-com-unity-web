import type { PetDocument } from "@/types";
import { getToken } from "@/features/auth/auth.service";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

function requireToken() {
  const token = getToken();
  if (!token) throw new Error("Please sign in to manage documents.");
  return token;
}

async function fetchDocumentsApi<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const token = requireToken();
  const { method = "GET", body, signal } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.message ?? "Something went wrong.");
  }

  return payload.data as T;
}

export async function getPetDocuments(
  petId: string,
  signal?: AbortSignal,
): Promise<PetDocument[]> {
  const data = await fetchDocumentsApi<PetDocument[]>(
    `/pets/${encodeURIComponent(petId)}/documents`,
    { signal },
  );
  return Array.isArray(data) ? data : [];
}

export type AddDocumentInput = {
  name: string;
  issuedDate: string;
  fileId: string;
  mimeType?: string;
};

export async function addPetDocument(
  petId: string,
  input: AddDocumentInput,
): Promise<PetDocument> {
  return fetchDocumentsApi<PetDocument>(
    `/pets/${encodeURIComponent(petId)}/documents`,
    { method: "POST", body: input },
  );
}

export async function deletePetDocument(
  petId: string,
  docId: string,
): Promise<void> {
  await fetchDocumentsApi<unknown>(
    `/pets/${encodeURIComponent(petId)}/documents/${encodeURIComponent(docId)}`,
    { method: "DELETE" },
  );
}

type UploadDocumentResult = { fileId: string; mimeType: string };

export async function uploadDocumentFile(
  file: File,
): Promise<UploadDocumentResult> {
  const token = requireToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/upload/document`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<{
    fileId?: string;
    mimeType?: string;
  }>;

  if (!response.ok) {
    throw new Error(payload.message ?? "Could not upload the file.");
  }

  const fileId = payload.data?.fileId;
  if (!fileId) throw new Error("Upload succeeded but no file ID was returned.");

  return { fileId, mimeType: payload.data?.mimeType ?? file.type };
}
