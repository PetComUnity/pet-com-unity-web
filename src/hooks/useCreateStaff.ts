"use client";

import { useState } from "react";
import { createStaff } from "../lib/api/staff.api";

export function useCreateStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await createStaff(formData);

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}