"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Edit3 } from "lucide-react";
import { PrivateImage } from "@/components/common/PrivateImage";
import type { AppUser } from "@/types";

type ProfileAvatarPanelProps = {
  error: string | null;
  previewUrl: string | null;
  uploading: boolean;
  user: AppUser;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ProfileAvatarPanel({
  error,
  previewUrl,
  uploading,
  user,
  onFileChange,
}: ProfileAvatarPanelProps) {
  const [inputKey, setInputKey] = useState(0);
  
  const fileId = user.imageFileId ?? user.avatarFileId ?? "";
  const imageUrl = previewUrl ?? user.imageUrl ?? user.avatarUrl ?? "";
  const isLogo = user.role === "vet" || user.role === "shelter";
  const imageAlt = isLogo ? "Organization logo" : "Profile avatar";

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event);
    setInputKey((currentKey) => currentKey + 1);
  }

  return (
    <div className="flex flex-col items-center gap-3 md:max-lg:items-start lg:items-start">
      <label className="group relative block h-[100px] w-[100px] cursor-pointer overflow-hidden rounded-[18px] border border-[#c8c8c8] bg-white focus-within:ring-2 focus-within:ring-[#1a202c]/20 md:max-lg:h-20">
        <span className="sr-only">
          {isLogo ? "Upload organization logo" : "Upload profile avatar"}
        </span>
        <Image
          src="/images/placeholder-owner-avatar.png"
          alt=""
          fill
          priority
          sizes="100px"
          className="object-cover"
        />

        {fileId && !previewUrl ? (
          <PrivateImage
            fileId={fileId}
            alt={imageAlt}
            fallbackSrc="/images/placeholder-owner-avatar.png"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <Edit3 className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <input
          key={inputKey}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={handleInputChange}
        />
      </label>

      <label className="inline-flex min-h-5 w-[100px] cursor-pointer items-center justify-center rounded-full bg-[#ff8a24] px-3 text-center text-[10px] font-semibold text-white transition focus-within:ring-2 focus-within:ring-[#1a202c]/25 focus-within:ring-offset-2 focus-within:outline-none hover:bg-[#e87918]">
        {uploading ? "Uploading..." : isLogo ? "+ Logo" : "+ Avatar"}
        <input
          key={`button-${inputKey}`}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={handleInputChange}
        />
      </label>

      {error ? (
        <p className="max-w-[132px] text-center text-xs font-medium text-[#b91c1c] lg:text-left">
          {error}
        </p>
      ) : null}
    </div>
  );
}