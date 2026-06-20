"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { Camera, ChevronDown, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  createPet,
  uploadPetImage,
  type CreatePetApiInput,
} from "@/features/pets/pet-api.service";
import type { Pet } from "@/types";

const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Other"] as const;

type SpeciesOption = (typeof speciesOptions)[number];

const breedOptionsBySpecies: Record<SpeciesOption, readonly string[]> = {
  Dog: [
    "Mixed breed",
    "Border Collie",
    "Labrador Retriever",
    "German Shepherd",
    "Golden Retriever",
    "Beagle",
    "Poodle",
    "Bulldog",
    "Other",
  ],
  Cat: [
    "Mixed breed",
    "Persian",
    "Siamese",
    "Maine Coon",
    "British Shorthair",
    "Ragdoll",
    "Bengal",
    "Other",
  ],
  Bird: [
    "Budgerigar",
    "Canary",
    "Cockatiel",
    "Lovebird",
    "Parrot",
    "Finch",
    "Other",
  ],
  Rabbit: [
    "Mixed breed",
    "Holland Lop",
    "Netherland Dwarf",
    "Lionhead",
    "Mini Rex",
    "Flemish Giant",
    "Other",
  ],
  Other: ["Other"],
};

const genderOptions = ["female", "male", "unknown"] as const;

const colorThemeOptions = ["None", "Red", "Orange", "Yellow", "Green", "Teal", "Blue", "Purple", "Pink", "Brown"] as const;

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
    themeColor: toOptionalText(getFormValue(formData, "color-theme")),
    isAdoptable: formData.has("isAdoptable"),
  };
}

export function AddPetModal({ onClose, onCreated }: AddPetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesOption | "">(
    "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const breedOptions = selectedSpecies
    ? breedOptionsBySpecies[selectedSpecies]
    : [];

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
      toast.success("Pet added successfully!");
      onCreated?.(createdPet);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We could not add your pet right now.",
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
            <div
              className="relative flex h-[292px] w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-[14px] border border-[#c8c8c8] bg-white transition hover:border-[#ff8a24]"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload photo"
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Pet avatar preview"
                  fill
                  unoptimized
                  className="object-cover object-center"
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

              <label htmlFor="species" className="block">
                <span className="sr-only">species</span>
                <span className="relative block">
                  <select
                    id="species"
                    name="species"
                    value={selectedSpecies}
                    onChange={(event) =>
                      setSelectedSpecies(
                        event.target.value as SpeciesOption | "",
                      )
                    }
                    className="h-11 w-full appearance-none rounded-[14px] border border-[#1a202c] bg-white px-4 pr-12 text-[1rem] text-[#1a202c] outline-none transition focus:ring-2 focus:ring-[#1a202c]/15 [&:invalid]:text-[#b8b8b8]"
                    required
                  >
                    <option value="" disabled>
                      species
                    </option>
                    {speciesOptions.map((option) => (
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

              <label htmlFor="breed" className="block">
                <span className="sr-only">breed</span>
                <span className="relative block">
                  <select
                    id="breed"
                    name="breed"
                    key={selectedSpecies || "no-species"}
                    defaultValue=""
                    disabled={!selectedSpecies}
                    className="h-11 w-full appearance-none rounded-[14px] border border-[#1a202c] bg-white px-4 pr-12 text-[1rem] text-[#1a202c] outline-none transition focus:ring-2 focus:ring-[#1a202c]/15 disabled:bg-[#f5f5f5] disabled:text-[#b8b8b8] [&:invalid]:text-[#b8b8b8]"
                    required
                  >
                    <option value="" disabled>
                      breed
                    </option>
                    {breedOptions.map((option) => (
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

              <label htmlFor="gender" className="block">
                <span className="sr-only">gender</span>
                <span className="relative block">
                  <select
                    id="gender"
                    name="gender"
                    defaultValue=""
                    className="h-11 w-full appearance-none rounded-[14px] border border-[#1a202c] bg-white px-4 pr-12 text-[1rem] text-[#1a202c] outline-none transition focus:ring-2 focus:ring-[#1a202c]/15 [&:invalid]:text-[#b8b8b8]"
                    required
                  >
                    <option value="" disabled>
                      gender
                    </option>
                    {genderOptions.map((option) => (
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

              <label
                htmlFor="ready-for-adoption"
                className="flex min-h-11 cursor-pointer items-center gap-3 px-4 text-[1rem] font-medium text-[#1a202c] transition focus-within:ring-2 focus-within:ring-[#1a202c]/15"
              >
                <input
                  id="ready-for-adoption"
                  name="isAdoptable"
                  type="checkbox"
                  className="h-5 w-5 rounded border-[#1a202c] accent-[#02b75b]"
                />
                <span>Ready for Adoption</span>
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
          </div>
        </form>
      </section>
    </div>
  );
}
