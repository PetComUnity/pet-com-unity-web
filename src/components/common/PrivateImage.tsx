"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/features/auth/auth.service";

type PrivateImageProps = {
  fileId: string;
  alt: string;
  className?: string;
  fallbackSrc: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export function PrivateImage({ fileId, alt, className, fallbackSrc }: PrivateImageProps) {
  const [src, setSrc] = useState<string | null>(fallbackSrc || null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const encodedFileId = fileId.replace(/\//g, "--");
    let blobUrl: string | null = null;

    fetch(`${API_BASE_URL}/files/${encodedFileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load image");
        return res.blob();
      })
      .then((blob) => {
        blobUrl = URL.createObjectURL(blob);
        setSrc(blobUrl);
      })
      .catch(() => setSrc(fallbackSrc));

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [fileId, fallbackSrc]);

  if (!src) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
