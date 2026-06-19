// hooks/useProfileAvatar.ts
import { useState, useEffect, type ChangeEvent } from "react";
import { uploadCurrentUserProfileImage } from "@/features/auth/auth.service";

export function useProfileAvatar(updateProfile: any, currentName: string) {
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Cleanup URL previews to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(nextPreviewUrl);
    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const uploaded = await uploadCurrentUserProfileImage(file);
      
      // Matches your OwnerProfile logic exactly
      await updateProfile(
        uploaded.type === "public"
          ? { avatarUrl: uploaded.url, avatarFileId: null, name: currentName }
          : { avatarFileId: uploaded.fileId, name: currentName }
      );
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "We could not upload this image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return { avatarPreviewUrl, uploadingAvatar, avatarError, handleAvatarChange };
}