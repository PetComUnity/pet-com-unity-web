"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PET_SPECIES_OPTIONS } from "@/features/pets/pet.utils";
import {
  petFormSchema,
  type PetFormInput,
  type PetFormValues,
} from "@/features/pets/pet.schema";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type PetFormProps = {
  initialValues?: Partial<PetFormInput>;
  initialImageUrl?: string;
  submitLabel?: string;
  busy?: boolean;
  onSubmit: (values: PetFormValues, imageFile?: File | null) => Promise<void>;
};

export function PetForm({
  initialValues,
  initialImageUrl,
  submitLabel = "Save pet",
  busy,
  onSubmit,
}: PetFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<PetFormInput, unknown, PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      species: initialValues?.species ?? "Dog",
      breed: initialValues?.breed ?? "",
      birthDate: initialValues?.birthDate ?? "",
      color: initialValues?.color ?? "",
      description: initialValues?.description ?? "",
      microchipId: initialValues?.microchipId ?? "",
      isAdoptable: initialValues?.isAdoptable ?? false,
    },
  });

  async function handleFormSubmit(values: PetFormValues) {
    setFormError(null);

    try {
      await onSubmit(values, imageFile);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "We could not save the pet right now.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pet profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Pet name"
              placeholder="Luna"
              error={errors.name?.message}
              {...register("name")}
            />
            <Select
              label="Species"
              error={errors.species?.message}
              {...register("species")}
            >
              {PET_SPECIES_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Input
              label="Breed"
              placeholder="Golden Retriever"
              error={errors.breed?.message}
              {...register("breed")}
            />
            <Input
              label="Birth date"
              type="date"
              error={errors.birthDate?.message}
              {...register("birthDate")}
            />
            <Input
              label="Color"
              placeholder="White and brown"
              error={errors.color?.message}
              {...register("color")}
            />
            <Input
              label="Microchip ID"
              placeholder="Optional"
              error={errors.microchipId?.message}
              {...register("microchipId")}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Helpful notes about the pet, temperament, or medications."
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <Input
              label="Pet photo"
              type="file"
              accept="image/*"
              hint={
                initialImageUrl
                  ? "Upload a new image only if you want to replace the current one."
                  : "Optional for the MVP starter."
              }
              onChange={(event) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
            />
            <label className="flex items-center gap-3 rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm text-foreground">
              <input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" {...register("isAdoptable")} />
              Available for adoption
            </label>
          </div>

          {formError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={busy || isSubmitting}>
              {busy || isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {initialImageUrl ? (
              <a
                href={initialImageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brand hover:text-brand-strong"
              >
                View current image
              </a>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
