import { Clinic } from "@/types";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyClinic(): Promise<Clinic> {
  const response = await fetch(
    `${API_URL}/clinics/me`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch clinic");
  }

  const result = await response.json();

  return result.data;
}

export async function updateMyClinic(
  payload: Partial<Clinic>,
): Promise<Clinic> {
  const response = await fetch(
    `${API_URL}/clinics/me`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update clinic");
  }

  const result = await response.json();

  return result.data;
}

