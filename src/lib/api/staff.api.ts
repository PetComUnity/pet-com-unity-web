import { getToken } from "@/features/auth/auth.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function createStaff(formData: FormData) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login again (no auth token found).");
  }

  const res = await fetch(`${API_URL}/staff`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create staff");
  }

  return data;
}