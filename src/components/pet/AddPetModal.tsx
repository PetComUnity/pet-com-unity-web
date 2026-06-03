"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, ChevronDown, Plus, X } from "lucide-react";
import {
  createPet,
  uploadPetImage,
  type CreatePetApiInput,
} from "@/features/pets/pet-api.service";
import type { Pet } from "@/types";

const primaryPetFormSelects = [
  {
    id: "species",
    placeholder: "species",
    options: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
  },
  {
    id: "breed",
    placeholder: "breed",
    options: [
      "Mixed breed",
      "Border Collie",
      "Labrador Retriever",
      "German Shepherd",
      "Persian",
      "Siamese",
      "Other",
    ],
  },
  {
    id: "gender",
    placeholder: "gender",
    options: ["female", "male", "unknown"],
  },
] as const;

const colorThemeOptions = ["Orange", "Green", "Blue", "Pink", "Purple"];

type AddPetModalProps = {
  onClose: () => void;
  onCreated?: (pet: Pet | null) => void;
};

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalText(value: string) {
  return value === "" ? undefined : value;
}

function getPetPayload(formData: FormData): CreatePetApiInput {
  const weightValue = getFormValue(formData, "weight");
  const parsedWeight = Number(weightValue);

  return {
    name: getFormValue(formData, "name"),
    species: getFormValue(formData, "species"),
    breed: toOptionalText(getFormValue(formData, "breed")),
    birthDate: toOptionalText(getFormValue(formData, "dateOfBirth")),
    microchipId: toOptionalText(getFormValue(formData, "chip")),
    gender: toOptionalText(getFormValue(formData, "gender")),
    weight:
      weightValue !== "" && Number.isFinite(parsedWeight)
        ? parsedWeight
        : undefined,
    colorTheme: toOptionalText(getFormValue(formData, "color-theme")),
  };
}

export function AddPetModal({ onClose, onCreated }: AddPetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [onClose, previewUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = getPetPayload(new FormData(event.currentTarget));

      if (selectedFile) {
        const uploaded = await uploadPetImage(selectedFile, "private");
        if (uploaded.type === "public") {
          payload.imageUrl = uploaded.url;
        } else {
          payload.imageFileId = uploaded.fileId;
        }
      }

      const createdPet = await createPet(payload);
      onCreated?.(createdPet);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not add your pet right now.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/35 p-0 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-pet-modal-title"
        className="relative w-full max-w-[1320px] rounded-b-[12px] bg-white px-5 pt-16 pb-12 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:rounded-[12px] sm:px-[60px] sm:pt-[65px] sm:pb-[60px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="add-pet-modal-title" className="sr-only">
          Add pet
        </h2>

        <button
          type="button"
          aria-label="Close add pet form"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center bg-[#ff8a24] text-white transition hover:bg-[#e87918] focus-visible:ring-2 focus-visible:ring-[#1a202c]/30 focus-visible:ring-offset-2 focus-visible:outline-none"
          onClick={onClose}
        >
          <X className="h-7 w-7 stroke-[3]" aria-hidden="true" />
        </button>

        <form
          onSubmit={handleSubmit}
          className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-[50px]"
        >
          <div className="flex flex-col items-center gap-9">
            <div className="flex h-[292px] w-[180px] items-center justify-center overflow-hidden rounded-[14px] border border-[#c8c8c8] bg-white">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pet avatar preview"
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#c8c8c8]" aria-hidden="true">
                  <Camera className="h-12 w-12" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Add a photo</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />

            <button
              type="button"
              className="inline-flex min-h-[68px] w-[180px] items-center justify-center rounded-[14px] bg-[#ff8a24] px-5 text-[1.08rem] font-medium text-white transition hover:bg-[#e87918] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? "Change Avatar" : "+ Pet Avatar"}
            </button>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="space-y-4">
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="name"
                required
                className="h-11 w-full rounded-[14px] border border-[#1a202c] bg-white px-4 text-[1rem] text-[#1a202c] outline-none transition placeholder:text-[#b8b8b8] focus:ring-2 focus:ring-[#1a202c]/15"
              />

              <label htmlFor="date-of-birth" className="sr-only">
                Date of birth
              </label>
              <div className="relative">
                <input
                  id="date-of-birth"
                  name="dateOfBirth"
                  type="text"
                  placeholder="date of birth"
                  className="h-11 w-full rounded-[14px] border border-[#1a202c] bg-white px-4 pr-12 text-[1rem] text-[#1a202c] outline-none transition placeholder:text-[#b8b8b8] focus:ring-2 focus:ring-[#1a202c]/15"
                />
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#1a202c]"
                />
              </div>

              <label htmlFor="chip" className="sr-only">
                Chip
              </label>
              <input
                id="chip"
                name="chip"
                type="text"
                placeholder="chip"
                className="h-11 w-full rounded-[14px] border border-[#1a202c] bg-white px-4 text-[1rem] text-[#1a202c] outline-none transition placeholder:text-[#b8b8b8] focus:ring-2 focus:ring-[#1a202c]/15"
              />

              {primaryPetFormSelects.map((field) => (
                <label key={field.id} htmlFor={field.id} className="block">
                  <span className="sr-only">{field.placeholder}</span>
                  <span className="relative block">
                    <select
                      id={field.id}
                      name={field.id}
                      defaultValue=""
                      className="h-11 w-full appearance-none rounded-[14px] border border-[#1a202c] bg-white px-4 pr-12 text-[1rem] text-[#1a202c] outline-none transition focus:ring-2 focus:ring-[#1a202c]/15 [&:invalid]:text-[#b8b8b8]"
                      required
                    >
                      <option value="" disabled>
                        {field.placeholder}
                      </option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#1a202c]"
                    />
                  </span>
                </label>
              ))}

              <label htmlFor="weight" className="sr-only">
                Weight
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                min="0"
                step="0.1"
                placeholder="weight"
                className="h-11 w-full rounded-[14px] border border-[#1a202c] bg-white px-4 text-[1rem] text-[#1a202c] outline-none transition placeholder:text-[#b8b8b8] focus:ring-2 focus:ring-[#1a202c]/15"
              />

              <label htmlFor="color-theme" className="block">
                <span className="sr-only">Color theme</span>
                <span className="relative block">
                  <select
                    id="color-theme"
                    name="color-theme"
                    defaultValue=""
                    className="h-11 w-full appearance-none rounded-[14px] border border-[#1a202c] bg-white px-4 pr-12 text-[1rem] text-[#1a202c] outline-none transition focus:ring-2 focus:ring-[#1a202c]/15 [&:invalid]:text-[#b8b8b8]"
                    required
                  >
                    <option value="" disabled>
                      color theme
                    </option>
                    {colorThemeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#1a202c]"
                  />
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="font-display mx-auto mt-10 inline-flex min-h-[68px] w-full max-w-[320px] items-center justify-center gap-4 rounded-[14px] border border-[#1a202c] bg-[#8df86e] px-8 text-[1.05rem] font-semibold text-[#010101] transition hover:bg-[#7eea60] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin rounded-full border-2 border-[#17243b]/30 border-t-[#17243b]"
                  />
                  {selectedFile ? "Uploading..." : "Adding..."}
                </>
              ) : (
                <>
                  <Plus className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
                  Add Pet
                </>
              )}
            </button>
            {submitError ? (
              <p className="mt-3 text-center text-sm font-medium text-[#b91c1c]">
                {submitError}
              </p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
