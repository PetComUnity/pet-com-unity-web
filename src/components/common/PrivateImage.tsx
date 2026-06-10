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
  "http://localhost:5000/api";

export function PrivateImage({
  fileId,
  alt,
  className,
  fallbackSrc,
  allowUnauthenticated = false,
}: PrivateImageProps) {
  const [imageState, setImageState] = useState<PrivateImageState | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token && !allowUnauthenticated) {
      let isMounted = true;

      if (fallbackSrc) {
        Promise.resolve().then(() => {
          if (isMounted) {
            setImageState({ fileId, src: fallbackSrc });
          }
        });
      }

      return () => {
        isMounted = false;
      };
    }

    const encodedFileId = fileId.replace(/\//g, "--");
    let isMounted = true;
    let blobUrl: string | null = null;

    fetch(`${API_BASE_URL}/files/${encodedFileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load image");
        return res.blob();
      })
      .then((blob) => {
        const nextBlobUrl = URL.createObjectURL(blob);
        blobUrl = nextBlobUrl;
        if (isMounted) {
          setImageState({ fileId, src: nextBlobUrl });
        } else {
          URL.revokeObjectURL(nextBlobUrl);
        }
      })
      .catch(() => {
        if (isMounted && fallbackSrc) {
          setImageState({ fileId, src: fallbackSrc });
        }
      });

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [allowUnauthenticated, fileId, fallbackSrc]);

  const src = imageState?.fileId === fileId ? imageState.src : null;

  if (!src) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
