"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/features/auth/auth.service";

type PrivateImageProps = {
  fileId: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  allowUnauthenticated?: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export function PrivateImage({
  fileId,
  alt,
  className,
  fallbackSrc,
  allowUnauthenticated = false,
}: PrivateImageProps) {
  const [src, setSrc] = useState<string | null>(fallbackSrc || null);

  useEffect(() => {
    const token = getToken();
    if (!token && !allowUnauthenticated) return;

    const encodedFileId = fileId.replace(/\//g, "--");
    let blobUrl: string | null = null;

    fetch(`${API_BASE_URL}/files/${encodedFileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load image");
        return res.blob();
      })
      .then((blob) => {
        blobUrl = URL.createObjectURL(blob);
        setSrc(blobUrl);
      })
      .catch(() => setSrc(fallbackSrc || null));

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [allowUnauthenticated, fileId, fallbackSrc]);

  if (!src) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
