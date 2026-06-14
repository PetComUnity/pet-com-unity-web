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

type PrivateImageState = {
  fileId: string;
  src: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001/api";

const privateImageSrcCache = new Map<string, string>();

export function PrivateImage({
  fileId,
  alt,
  className,
  fallbackSrc,
  allowUnauthenticated = false,
}: PrivateImageProps) {
  const [imageState, setImageState] = useState<PrivateImageState | null>(() => {
    const cachedSrc = privateImageSrcCache.get(fileId);
    return cachedSrc ? { fileId, src: cachedSrc } : null;
  });

  useEffect(() => {
    if (privateImageSrcCache.has(fileId)) {
      return undefined;
    }

    const token = getToken();
    if (!token && !allowUnauthenticated) {
      let isMounted = true;
      if (fallbackSrc) {
        Promise.resolve().then(() => {
          if (isMounted) setImageState({ fileId, src: fallbackSrc });
        });
      }
      return () => { isMounted = false; };
    }

    const encodedFileId = fileId.replace(/\//g, "--");
    let isMounted = true;

    fetch(`${API_BASE_URL}/files/${encodedFileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load image");
        return res.blob();
      })
      .then((blob) => {
        const nextBlobUrl = URL.createObjectURL(blob);
        privateImageSrcCache.set(fileId, nextBlobUrl);

        if (isMounted) {
          setImageState({ fileId, src: nextBlobUrl });
        }
      })
      .catch(() => {
        if (isMounted && fallbackSrc) setImageState({ fileId, src: fallbackSrc });
      });

    return () => {
      isMounted = false;
    };
  }, [fileId, fallbackSrc, allowUnauthenticated]);

  const cachedSrc = privateImageSrcCache.get(fileId);
  const src =
    cachedSrc ?? (imageState?.fileId === fileId ? imageState.src : null);

  if (!src) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
