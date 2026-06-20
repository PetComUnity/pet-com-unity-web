"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface Props {
  imageUrl?: string | null;
  onChange: (file: File | null) => void;
}

export default function StaffAvatarUpload({
  imageUrl,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onClick={() => inputRef.current?.click()}
        className="
          relative
          flex
          h-[292px]
          w-[180px]
          cursor-pointer
          items-center
          justify-center
          overflow-hidden
          rounded-[14px]
          border
          border-[#d9d9d9]
        "
      >
        {imageUrl ? (
          <Image
            fill
            src={imageUrl}
            alt="staff"
            className="object-cover"
            unoptimized
          />
        ) : (
          <Camera
            size={48}
            className="text-[#c8c8c8]"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="
          rounded-[14px]
          bg-[#ff8a24]
          px-6
          py-3
          text-white
        "
      >
        Add Photo
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onChange(
            e.target.files?.[0] ?? null
          )
        }
      />
    </div>
  );
}