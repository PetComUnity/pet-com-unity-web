"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  clinicVerificationSchema,
  microchipLookupSchema,
  type ClinicVerificationFormValues,
  type MicrochipLookupFormValues,
} from "@/features/clinic-verification/clinic-verification.schema";
import {
  lookupPetByMicrochipId,
  submitPetVerification,
} from "@/features/clinic-verification/clinic-verification.service";
import type {
  VerificationDecision,
  VerificationDoctor,
  VerificationLookupPet,
} from "@/features/clinic-verification/clinic-verification.types";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { VerificationStatusBadge } from "@/components/verification/VerificationStatusBadge";

type PetVerificationPanelProps = {
  doctors?: VerificationDoctor[];
  currentVerifier?: VerificationDoctor | null;
  onVerificationSubmitted?: (pet: VerificationLookupPet) => void;
};

const verificationDefaultValues: ClinicVerificationFormValues = {
  doctorId: "",
  microchipMatched: false,
  passportMatched: false,
  visualCheckPassed: false,
  note: "",
};

function formatDate(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = isoDateMatch
    ? new Date(
        Number(isoDateMatch[1]),
        Number(isoDateMatch[2]) - 1,
        Number(isoDateMatch[3]),
      )
    : new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function getDisplayText(value?: string | number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "Not added";
  }

  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not added";
}

function getBirthOrAgeText(pet: VerificationLookupPet) {
  const dateOfBirth = formatDate(pet.dateOfBirth);

  if (dateOfBirth) {
    return dateOfBirth;
  }

  if (typeof pet.age === "number") {
    return `${pet.age} years`;
  }

  return getDisplayText(pet.age);
}

function getDecisionSuccessMessage(result: VerificationDecision) {
  if (result === "verified") {
    return "Pet verification was approved.";
  }

  if (result === "pending") {
    return "Pet verification was marked as pending.";
  }

  return "Pet verification was rejected.";
}

function PetPreview({ pet }: { pet: VerificationLookupPet }) {
  const verifiedAt = formatDate(pet.verifiedAt);

  return (
    <section
      aria-label="Pet verification preview"
      className="grid gap-5 rounded-lg border border-[#e5d8c7] bg-[#fffaf4] p-4 md:grid-cols-[160px_minmax(0,1fr)]"
    >
      <div className="flex aspect-square min-h-40 items-center justify-center overflow-hidden rounded-lg border border-[#e5d8c7] bg-[#f0ebe4]">
        {pet.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pet.imageUrl}
            alt={`${pet.name} pet profile photo`}
            className="h-full w-full object-cover"
          />
        ) : (
          <PawPrint
            className="h-16 w-16 text-[#c9b99a]"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-[#1a202c]">
              {pet.name}
            </h3>
            <p className="text-sm text-[#5f5449]">
              {pet.species}
              {pet.breed ? ` - ${pet.breed}` : ""}
            </p>
          </div>
          <VerificationStatusBadge status={pet.verificationStatus} />
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[#1a202c]">Gender</dt>
            <dd className="text-[#5f5449]">{getDisplayText(pet.gender)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#1a202c]">Date of birth</dt>
            <dd className="text-[#5f5449]">{getBirthOrAgeText(pet)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#1a202c]">Microchip number</dt>
            <dd className="break-words text-[#5f5449]">
              {getDisplayText(pet.microchipId)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[#1a202c]">Passport number</dt>
            <dd className="break-words text-[#5f5449]">
              {getDisplayText(pet.passportNumber)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[#1a202c]">Verified clinic</dt>
            <dd className="text-[#5f5449]">
              {getDisplayText(pet.verifiedClinicName)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[#1a202c]">Verified date</dt>
            <dd className="text-[#5f5449]">{verifiedAt ?? "Not added"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function PetVerificationPanel({
  doctors = [],
  currentVerifier,
  onVerificationSubmitted,
}: PetVerificationPanelProps) {
  const [pet, setPet] = useState<VerificationLookupPet | null>(null);
  const [searching, setSearching] = useState(false);
  const [submittingDecision, setSubmittingDecision] =
    useState<VerificationDecision | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const lookupForm = useForm<MicrochipLookupFormValues>({
    defaultValues: {
      microchipId: "",
    },
    resolver: zodResolver(microchipLookupSchema),
  });

  const verificationForm = useForm<ClinicVerificationFormValues>({
    defaultValues: verificationDefaultValues,
    resolver: zodResolver(clinicVerificationSchema),
  });

  const watchedChecks = verificationForm.watch([
    "microchipMatched",
    "passportMatched",
    "visualCheckPassed",
  ]);
  const allChecksPassed = watchedChecks.every(Boolean);
  const hasDoctors = doctors.length > 0;
  const isSubmitting = submittingDecision !== null;

  const verifierById = useMemo(
    () => new Map(doctors.map((doctor) => [doctor.id, doctor])),
    [doctors],
  );

  async function handleLookup(values: MicrochipLookupFormValues) {
    setSearching(true);
    setNotFound(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPet(null);
    verificationForm.reset(verificationDefaultValues);

    try {
      const foundPet = await lookupPetByMicrochipId(
        values.microchipId,
      );

      if (!foundPet) {
        setNotFound(true);
        return;
      }

      setPet(foundPet);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not search for this pet right now.",
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleDecision(result: VerificationDecision) {
    if (!pet) {
      return;
    }

    const valid = await verificationForm.trigger();

    if (!valid) {
      return;
    }

    const values = verificationForm.getValues();
    const note = values.note?.trim();

    if (result === "rejected" && !note) {
      verificationForm.setError("note", {
        message: "Add a note before rejecting verification.",
        type: "manual",
      });
      return;
    }

    const selectedDoctor = values.doctorId
      ? verifierById.get(values.doctorId)
      : undefined;
    const verifier = selectedDoctor ?? currentVerifier ?? undefined;
    const nextPetFallback: VerificationLookupPet = {
      ...pet,
      verificationStatus: result,
      verifiedAt:
        result === "verified" ? new Date().toISOString() : pet.verifiedAt,
    };

    setSubmittingDecision(result);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedPet = await submitPetVerification(pet.id, {
        microchipId:
          pet.microchipId ??
          lookupForm.getValues("microchipId").trim(),
        result,
        microchipMatched: values.microchipMatched,
        passportMatched: values.passportMatched,
        visualCheckPassed: values.visualCheckPassed,
        note: note || undefined,
        doctorId: verifier?.id,
        doctorName: verifier?.name,
      });
      const nextPet = updatedPet ?? nextPetFallback;

      setPet(nextPet);
      onVerificationSubmitted?.(nextPet);
      setSuccessMessage(getDecisionSuccessMessage(result));
      verificationForm.reset({
        ...verificationDefaultValues,
        doctorId: values.doctorId ?? "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not submit this verification right now.",
      );
    } finally {
      setSubmittingDecision(null);
    }
  }

  return (
    <Card className="border-[#e5d8c7]">
      <CardHeader>
        <CardTitle>Pet verification</CardTitle>
        <CardDescription>
          Search by microchip and record the clinic verification decision.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          onSubmit={lookupForm.handleSubmit(handleLookup)}
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
        >
          <Input
            label="Microchip number"
            placeholder="Enter microchip number"
            autoComplete="off"
            error={lookupForm.formState.errors.microchipId?.message}
            {...lookupForm.register("microchipId")}
          />
          <Button type="submit" disabled={searching} className="sm:mt-7">
            {searching ? (
              "Searching..."
            ) : (
              <>
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </>
            )}
          </Button>
        </form>

        {searching ? <Spinner label="Searching pet profile..." /> : null}

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {notFound ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            No pet profile matched this microchip number.
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        ) : null}

        {pet ? (
          <div className="space-y-5">
            <PetPreview pet={pet} />

            <form className="space-y-5">
              {hasDoctors ? (
                <Select
                  label="Doctor"
                  error={verificationForm.formState.errors.doctorId?.message}
                  {...verificationForm.register("doctorId")}
                >
                  <option value="">Use current verifier</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </Select>
              ) : currentVerifier?.name ? (
                <div className="rounded-lg border border-[#e5d8c7] bg-white px-4 py-3 text-sm text-[#5f5449]">
                  <span className="font-medium text-[#1a202c]">Verifier:</span>{" "}
                  {currentVerifier.name}
                </div>
              ) : null}

              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="sr-only">Verification checks</legend>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[#e5d8c7] bg-white px-4 py-3 text-sm font-medium text-[#1a202c]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#02b75b]"
                    {...verificationForm.register("microchipMatched")}
                  />
                  <span>Microchip matches the profile</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[#e5d8c7] bg-white px-4 py-3 text-sm font-medium text-[#1a202c]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#02b75b]"
                    {...verificationForm.register("passportMatched")}
                  />
                  <span>Passport/document data matches</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[#e5d8c7] bg-white px-4 py-3 text-sm font-medium text-[#1a202c]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#02b75b]"
                    {...verificationForm.register("visualCheckPassed")}
                  />
                  <span>Visual check passed</span>
                </label>
              </fieldset>

              <Textarea
                label="Note"
                maxLength={500}
                error={verificationForm.formState.errors.note?.message}
                hint="Required when rejecting a verification."
                {...verificationForm.register("note")}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  disabled={!allChecksPassed || isSubmitting}
                  onClick={() => void handleDecision("verified")}
                >
                  {submittingDecision === "verified"
                    ? "Verifying..."
                    : "Verify pet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => void handleDecision("pending")}
                >
                  {submittingDecision === "pending"
                    ? "Saving..."
                    : "Mark as pending"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={() => void handleDecision("rejected")}
                >
                  {submittingDecision === "rejected"
                    ? "Rejecting..."
                    : "Reject verification"}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
