"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { PrivateImage } from "@/components/common/PrivateImage";
import { Spinner } from "@/components/ui/Spinner";
import { ROLE_LABELS } from "@/constants/roles";
import { getPetDetailsRoute, ROUTES } from "@/constants/routes";
import {
  getMyPets,
  getPetById,
  updatePet,
  uploadPetImage,
  type UpdatePetApiInput,
} from "@/features/pets/pet-api.service";
import { getColorForPet } from "@/features/pets/pet-theme-colors";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Pet, PetOwnerInfo } from "@/types";

const fallbackPetImageSrc = "/images/dog-black.png";
const fallbackOwnerAvatarSrc = "/images/placeholder-owner-avatar.png";

const petDetailsTabs = [
  { id: "details", label: "Pet Details" },
  { id: "documents", label: "Documents" },
  { id: "vaccinations", label: "Vaccinations" },
  { id: "calendar", label: "My Calendar" },
] as const;

const speciesOptions = ["dog", "cat", "bird", "rabbit", "other"];
const fallbackBreedOptions = [
  "Mixed breed",
  "Collie",
  "Border Collie",
  "Labrador Retriever",
  "German Shepherd",
  "Persian",
  "Siamese",
  "Other",
];
const breedOptionsBySpecies: Record<string, string[]> = {
  dog: [
    "Mixed breed",
    "Collie",
    "Border Collie",
    "Labrador Retriever",
    "German Shepherd",
    "Other",
  ],
  cat: ["Mixed breed", "Persian", "Siamese", "Maine Coon", "Other"],
  bird: ["Parrot", "Canary", "Cockatiel", "Budgie", "Other"],
  rabbit: ["Holland Lop", "Netherland Dwarf", "Rex", "Lionhead", "Other"],
  other: ["Other"],
};
const genderOptions = ["female", "male", "unknown"];
const colorOptions = [
  "Black",
  "White",
  "Brown",
  "Gray",
  "Golden",
  "Orange",
  "Blue",
  "Yellow",
  "Other",
  "Mixed",
];
const weightOptions = Array.from({ length: 80 }, (_, index) => `${index + 1} kg`);

const textFormFieldNames = [
  "name",
  "birthDate",
  "microchipId",
  "species",
  "weight",
  "breed",
  "color",
  "gender",
] as const;

const formFieldNames = [...textFormFieldNames, "isAdoptable"] as const;

type TextFormFieldName = (typeof textFormFieldNames)[number];
type FormFieldName = (typeof formFieldNames)[number];

type PetDetailsFormState = Record<TextFormFieldName, string> & {
  isAdoptable: boolean;
};

const emptyFormState: PetDetailsFormState = {
  name: "",
  birthDate: "",
  microchipId: "",
  species: "",
  weight: "",
  breed: "",
  color: "",
  gender: "",
  isAdoptable: false,
};

type SaveStatus = "idle" | "saving" | "saved";

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function formatBirthDateForForm(value?: string) {
  if (!value) {
    return "";
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  }

  return value;
}

function normalizeBirthDate(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const day = dotMatch[1].padStart(2, "0");
    const month = dotMatch[2].padStart(2, "0");
    return `${dotMatch[3]}-${month}-${day}`;
  }

  return trimmed;
}

function formatWeightForForm(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)} kg`;
}

function normalizeWeight(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const parsedValue = Number(trimmed.replace(",", ".").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsedValue)) {
    throw new Error("Enter a valid weight.");
  }

  return parsedValue;
}

function toApiText(value: string) {
  return value.trim();
}

function buildFormState(pet: Pet): PetDetailsFormState {
  return {
    name: pet.name ?? "",
    birthDate: formatBirthDateForForm(pet.birthDate),
    microchipId: pet.microchipId ?? "",
    species: pet.species ?? "",
    weight: formatWeightForForm(pet.weight),
    breed: pet.breed ?? "",
    color: pet.color ?? "",
    gender: pet.gender ?? "",
    isAdoptable: pet.isAdoptable,
  };
}

function areSameFormStates(
  left: PetDetailsFormState,
  right: PetDetailsFormState,
) {
  return formFieldNames.every((fieldName) => left[fieldName] === right[fieldName]);
}

function withCurrentOption(options: string[], currentValue: string) {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

function getBreedOptionsForSpecies(species: string) {
  const speciesKey = species.trim().toLowerCase();
  return breedOptionsBySpecies[speciesKey] ?? fallbackBreedOptions;
}

function getPetFieldUpdatePayload(
  fieldName: FormFieldName,
  formState: PetDetailsFormState,
): UpdatePetApiInput {
  switch (fieldName) {
    case "name": {
      const name = formState.name.trim();
      if (name === "") {
        throw new Error("Pet name is required.");
      }
      return { name };
    }
    case "species": {
      const species = formState.species.trim();
      if (species === "") {
        throw new Error("Species is required.");
      }
      return { species };
    }
    case "breed":
      return { breed: toApiText(formState.breed) };
    case "birthDate":
      return { birthDate: normalizeBirthDate(formState.birthDate) };
    case "microchipId":
      return { microchipId: toApiText(formState.microchipId) };
    case "gender":
      return { gender: toApiText(formState.gender) };
    case "weight":
      return { weight: normalizeWeight(formState.weight) };
    case "color":
      return { color: toApiText(formState.color) };
    case "isAdoptable":
      return { isAdoptable: formState.isAdoptable };
  }
}

function toOptionalPetText(value: string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function mergePetWithPayload(pet: Pet, payload: UpdatePetApiInput): Pet {
  const nextPet: Pet = {
    ...pet,
  };

  if ("name" in payload && typeof payload.name === "string") {
    nextPet.name = payload.name;
  }

  if ("species" in payload && typeof payload.species === "string") {
    nextPet.species = payload.species;
  }

  if ("breed" in payload) {
    nextPet.breed = toOptionalPetText(payload.breed);
  }

  if ("birthDate" in payload) {
    nextPet.birthDate = toOptionalPetText(payload.birthDate);
  }

  if ("microchipId" in payload) {
    nextPet.microchipId = toOptionalPetText(payload.microchipId);
  }

  if ("gender" in payload) {
    nextPet.gender = toOptionalPetText(payload.gender);
  }

  if ("weight" in payload) {
    nextPet.weight =
      typeof payload.weight === "number" && Number.isFinite(payload.weight)
        ? payload.weight
        : undefined;
  }

  if ("color" in payload) {
    nextPet.color = toOptionalPetText(payload.color);
  }

  if ("isAdoptable" in payload && typeof payload.isAdoptable === "boolean") {
    nextPet.isAdoptable = payload.isAdoptable;
  }

  return nextPet;
}

function tabClassName(isActive: boolean) {
  return cn(
    "relative shrink-0 pb-2 text-left font-display text-[1.35rem] leading-none text-[#1a1720] transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff8a24]/35 focus-visible:ring-offset-4",
    "sm:text-[1.45rem] lg:text-[1.55rem]",
    isActive ? "text-[#1a1720]" : "text-[#2d2925] hover:text-[#010101]",
  );
}

function getOwnerText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not added";
}

type OwnerInfoFieldProps = {
  value: string;
  className?: string;
};

function OwnerInfoField({ value, className }: OwnerInfoFieldProps) {
  return (
    <div
      className={cn(
        "relative flex h-11 min-w-0 items-center rounded-[14px] border border-[#c8c8c8] bg-white px-4 pr-11 text-[0.98rem] font-medium text-[#1a202c]",
        className,
      )}
    >
      <span className="min-w-0 truncate">{value}</span>
      <Pencil
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#1a202c]"
        strokeWidth={1.8}
      />
    </div>
  );
}

function OwnerAvatar({ owner }: { owner: PetOwnerInfo }) {
  if (owner.imageFileId) {
    return (
      <PrivateImage
        fileId={owner.imageFileId}
        alt=""
        className="h-full w-full object-cover"
        fallbackSrc={fallbackOwnerAvatarSrc}
      />
    );
  }

  if (owner.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={owner.imageUrl} alt="" className="h-full w-full object-cover" />;
  }

  return (
    <Image
      src={fallbackOwnerAvatarSrc}
      alt=""
      fill
      sizes="96px"
      className="object-cover"
      priority
    />
  );
}

function OwnerInfoCard({ owner }: { owner: PetOwnerInfo }) {
  const ownerLocation = getOwnerText(owner.city);
  const ownerRoleLabel = owner.role ? ROLE_LABELS[owner.role] : "Owner";

  return (
    <section className="rounded-[18px] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)] sm:p-6 lg:px-7 lg:py-6">
      <div className="grid gap-5 lg:grid-cols-[110px_minmax(220px,270px)_minmax(260px,1fr)_minmax(180px,268px)] lg:items-center lg:gap-x-9 lg:gap-y-6">
        <div className="flex flex-col items-center gap-3 lg:row-span-2">
          <div className="relative h-20 w-24 overflow-hidden rounded-[14px] border border-[#c8c8c8] bg-white">
            <OwnerAvatar owner={owner} />
          </div>
          <span className="inline-flex h-5 w-24 items-center justify-center rounded-full bg-[#ff8a24] px-4 text-[0.78rem] font-semibold text-white">
            + Avatar
          </span>
        </div>

        <OwnerInfoField value={getOwnerText(owner.name)} />
        <OwnerInfoField value={getOwnerText(owner.email)} />
        <div className="hidden lg:block" aria-hidden="true" />

        <OwnerInfoField value={getOwnerText(owner.phone)} />
        <OwnerInfoField
          value={ownerLocation}
          className="lg:col-span-1"
        />
        <div className="flex h-11 items-center justify-center rounded-[14px] border border-[#65c84f] bg-[#97ff7b] px-6 text-[0.98rem] font-medium text-[#1a202c]">
          {ownerRoleLabel}
        </div>
      </div>
    </section>
  );
}

function getPublicOwnerInfo(pet: Pet): PetOwnerInfo {
  return pet.owner ?? { city: pet.location, role: "owner" };
}

type PetAvatarLinkProps = {
  pet: Pet;
  isActive: boolean;
};

function PetAvatarLink({ pet, isActive }: PetAvatarLinkProps) {
  return (
    <Link
      href={getPetDetailsRoute(pet.id)}
      aria-label={`Open ${pet.name} details`}
      title={pet.name}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-[5px] transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none",
        isActive ? "scale-105" : "",
      )}
      style={
        {
          "--tw-ring-color": getColorForPet(pet.themeColor),
        } as CSSProperties
      }
    >
      {pet.imageFileId ? (
        <PrivateImage
          fileId={pet.imageFileId}
          alt=""
          className="h-full w-full object-cover"
          fallbackSrc={fallbackPetImageSrc}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pet.imageUrl ?? fallbackPetImageSrc}
          alt=""
          className="h-full w-full object-cover"
        />
      )}
    </Link>
  );
}

function getCenteredPetStartIndex(pets: Pet[], currentPetId: string) {
  const maxStartIndex = Math.max(0, pets.length - 3);
  const currentPetIndex = pets.findIndex((pet) => pet.id === currentPetId);

  if (currentPetIndex <= 1) {
    return 0;
  }

  return Math.min(currentPetIndex - 1, maxStartIndex);
}

function PetAvatarCarousel({
  currentPetId,
  initialStartIndex,
  pets,
}: {
  currentPetId: string;
  initialStartIndex: number;
  pets: Pet[];
}) {
  const [startIndex, setStartIndex] = useState(initialStartIndex);
  const maxStartIndex = Math.max(0, pets.length - 3);
  const hasMorePets = pets.length > 3;
  const visiblePets = pets.slice(startIndex, startIndex + 3);

  function showPreviousPets() {
    setStartIndex((currentStartIndex) => Math.max(0, currentStartIndex - 1));
  }

  function showNextPets() {
    setStartIndex((currentStartIndex) =>
      Math.min(maxStartIndex, currentStartIndex + 1),
    );
  }

  if (visiblePets.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {hasMorePets ? (
        <button
          type="button"
          aria-label="Show previous pets"
          title="Show previous pets"
          disabled={startIndex === 0}
          onClick={showPreviousPets}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1a202c]/20 bg-white text-[#1a202c] transition hover:-translate-y-0.5 hover:bg-[#fff4e8] focus-visible:ring-2 focus-visible:ring-[#ff8a24]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      <div className="flex w-[132px] items-center justify-center gap-3">
        {visiblePets.map((pet) => (
          <PetAvatarLink
            key={pet.id}
            pet={pet}
            isActive={pet.id === currentPetId}
          />
        ))}
      </div>

      {hasMorePets ? (
        <button
          type="button"
          aria-label="Show next pets"
          title="Show next pets"
          disabled={startIndex >= maxStartIndex}
          onClick={showNextPets}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1a202c]/20 bg-white text-[#1a202c] transition hover:-translate-y-0.5 hover:bg-[#fff4e8] focus-visible:ring-2 focus-visible:ring-[#ff8a24]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function PetsQuickNav({
  currentPetId,
  pets,
}: {
  currentPetId: string;
  pets: Pet[];
}) {
  const initialStartIndex = getCenteredPetStartIndex(pets, currentPetId);
  const carouselKey = `${currentPetId}:${pets.map((pet) => pet.id).join("|")}`;

  return (
    <nav
      aria-label="Pet detail navigation"
      className="flex min-h-11 items-center justify-between gap-4 rounded-[14px]"
    >
      <Link
        href={ROUTES.pets}
        className="font-display inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#ff8a24] px-8 text-[1.45rem] leading-none font-semibold text-white transition hover:bg-[#e87918] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" strokeWidth={2.6} />
        My pets
      </Link>

      <div className="flex items-center gap-4 pr-2">
        <PetAvatarCarousel
          key={carouselKey}
          currentPetId={currentPetId}
          initialStartIndex={initialStartIndex}
          pets={pets}
        />
      </div>
    </nav>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  name: TextFormFieldName;
  value: string;
  className?: string;
  editable?: boolean;
  inputMode?: "text" | "decimal" | "numeric";
  onBlur: () => void;
  onChange: (name: TextFormFieldName, value: string) => void;
};

function TextField({
  id,
  label,
  name,
  value,
  className,
  editable = true,
  inputMode = "text",
  onBlur,
  onChange,
}: TextFieldProps) {
  return (
    <label htmlFor={id} className={cn("block space-y-3", className)}>
      <span className="block text-[0.98rem] leading-none font-medium text-[#1a202c]">
        {label}
      </span>
      <span className="relative block">
        <input
          id={id}
          name={name}
          type="text"
          inputMode={inputMode}
          value={value}
          readOnly={!editable}
          onBlur={() => {
            if (editable) {
              onBlur();
            }
          }}
          onChange={(event) => {
            if (editable) {
              onChange(name, event.target.value);
            }
          }}
          className={cn(
            "h-11 w-full rounded-[14px] border border-[#1a202c] bg-white px-4 text-[1rem] text-[#1a202c] outline-none transition focus:ring-2 focus:ring-[#1a202c]/15",
            editable ? "pr-11" : "cursor-default",
          )}
        />
        {editable ? (
          <Pencil
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#1a202c]"
            strokeWidth={1.8}
          />
        ) : null}
      </span>
    </label>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  name: TextFormFieldName;
  options: string[];
  value: string;
  className?: string;
  editable?: boolean;
  onBlur: () => void;
  onChange: (
    name: TextFormFieldName,
    value: string,
    shouldSave?: boolean,
  ) => void;
};

function SelectField({
  id,
  label,
  name,
  options,
  value,
  className,
  editable = true,
  onBlur,
  onChange,
}: SelectFieldProps) {
  return (
    <label htmlFor={id} className={cn("block space-y-3", className)}>
      <span className="block text-[0.98rem] leading-none font-medium text-[#1a202c]">
        {label}
      </span>
      <span className="relative block">
        <select
          id={id}
          name={name}
          value={value}
          disabled={!editable}
          onBlur={() => {
            if (editable) {
              onBlur();
            }
          }}
          onChange={(event) => {
            if (editable) {
              onChange(name, event.target.value, true);
            }
          }}
          className="h-11 w-full appearance-none rounded-[14px] border border-[#1a202c] bg-white px-4 pr-12 text-[1rem] text-[#1a202c] outline-none transition focus:ring-2 focus:ring-[#1a202c]/15 disabled:cursor-default disabled:opacity-100"
        >
          <option value="" />
          {withCurrentOption(options, value).map((option) => (
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
  );
}

type CheckboxFieldProps = {
  id: string;
  label: string;
  name: "isAdoptable";
  checked: boolean;
  className?: string;
  editable?: boolean;
  onChange: (name: "isAdoptable", checked: boolean) => void;
};

function CheckboxField({
  id,
  label,
  name,
  checked,
  className,
  editable = true,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "block space-y-3",
        editable ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      <span className="block text-[0.98rem] leading-none font-medium text-[#1a202c]">
        adoption
      </span>
      <span className="flex h-11 items-center gap-3 text-[1rem] font-medium text-[#1a202c] transition focus-within:ring-2 focus-within:ring-[#1a202c]/15">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={!editable}
          onChange={(event) => {
            if (editable) {
              onChange(name, event.target.checked);
            }
          }}
          className="h-5 w-5 rounded border-[#1a202c] accent-[#02b75b] disabled:opacity-100"
        />
        <span>{label}</span>
      </span>
    </label>
  );
}

export default function PetDetailsPage() {
  const params = useParams<{ petId: string }>();
  const router = useRouter();
  const { appUser, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastChangedFieldRef = useRef<FormFieldName | null>(null);
  const petId = getRouteParam(params.petId);

  const [pet, setPet] = useState<Pet | null>(null);
  const [formState, setFormState] =
    useState<PetDetailsFormState>(emptyFormState);
  const [savedFormState, setSavedFormState] =
    useState<PetDetailsFormState>(emptyFormState);
  const [ownerPets, setOwnerPets] = useState<Pet[]>([]);
  const [loadingPet, setLoadingPet] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingLostStatus, setUpdatingLostStatus] = useState(false);
  const isPetOwner = Boolean(appUser && pet?.ownerId === appUser.id);
  const canEditPet = isPetOwner;
  const visiblePetDetailsTabs = appUser
    ? petDetailsTabs
    : petDetailsTabs.filter((tab) => tab.id !== "calendar");
  const publicOwnerInfo = pet && !isPetOwner ? getPublicOwnerInfo(pet) : null;

  const loadPet = useCallback(
    async (signal?: AbortSignal) => {
      if (!petId) {
        return;
      }

      try {
        setLoadingPet(true);
        setLoadError(null);
        const result = await getPetById(petId, signal);

        if (signal?.aborted) {
          return;
        }

        setPet(result);
        if (result) {
          const nextFormState = buildFormState(result);
          setFormState(nextFormState);
          setSavedFormState(nextFormState);
        }
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "We could not load this pet right now.",
        );
      } finally {
        if (!signal?.aborted) {
          setLoadingPet(false);
        }
      }
    },
    [petId],
  );

  const loadOwnerPets = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await getMyPets(signal);
      if (!signal?.aborted) {
        setOwnerPets(result);
      }
    } catch {
      if (!signal?.aborted) {
        setOwnerPets([]);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    void Promise.resolve().then(() => loadPet(abortController.signal));

    return () => {
      abortController.abort();
    };
  }, [loadPet]);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!appUser) {
      void Promise.resolve().then(() => setOwnerPets([]));
      return undefined;
    }

    const abortController = new AbortController();
    void Promise.resolve().then(() => loadOwnerPets(abortController.signal));

    return () => {
      abortController.abort();
    };
  }, [appUser, authLoading, loadOwnerPets]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  function handleTabClick(tabId: (typeof petDetailsTabs)[number]["id"]) {
    if (tabId === "calendar") {
      router.push(ROUTES.calendar);
    }
  }

  async function savePetDetails(
    fieldName: FormFieldName,
    nextFormState = formState,
  ) {
    if (
      !canEditPet ||
      !pet ||
      nextFormState[fieldName] === savedFormState[fieldName]
    ) {
      return;
    }

    try {
      setSaveStatus("saving");
      setFormError(null);
      const payload = getPetFieldUpdatePayload(fieldName, nextFormState);
      const updatedPet = await updatePet(pet.id, payload);
      const mergedPet = updatedPet ?? mergePetWithPayload(pet, payload);
      const normalizedFormState = buildFormState(mergedPet);

      setPet(mergedPet);
      setSavedFormState(normalizedFormState);
      setFormState((currentFormState) =>
        areSameFormStates(currentFormState, nextFormState)
          ? normalizedFormState
          : currentFormState,
      );
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("idle");
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not update this pet right now.",
      );
    }
  }

  function updateFormField(
    name: TextFormFieldName,
    value: string,
    shouldSave = false,
  ) {
    if (!canEditPet) {
      return;
    }

    const nextFormState = { ...formState, [name]: value };
    lastChangedFieldRef.current = name;
    setFormState(nextFormState);
    setSaveStatus("idle");

    if (shouldSave) {
      void savePetDetails(name, nextFormState);
    }
  }

  function updateAdoptionStatus(name: "isAdoptable", checked: boolean) {
    if (!canEditPet) {
      return;
    }

    const nextFormState = { ...formState, [name]: checked };
    lastChangedFieldRef.current = name;
    setFormState(nextFormState);
    setSaveStatus("idle");
    void savePetDetails(name, nextFormState);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEditPet) {
      return;
    }

    const changedField =
      formFieldNames.find(
        (fieldName) => formState[fieldName] !== savedFormState[fieldName],
      ) ?? lastChangedFieldRef.current;

    if (changedField) {
      void savePetDetails(changedField);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !pet || !canEditPet) {
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(nextPreviewUrl);

    try {
      setUploadingAvatar(true);
      setFormError(null);
      const uploaded = await uploadPetImage(file, "private");
      const imagePayload: UpdatePetApiInput =
        uploaded.type === "public"
          ? { imageUrl: uploaded.url, imageFileId: null }
          : { imageFileId: uploaded.fileId };
      const updatedPet = await updatePet(pet.id, imagePayload);

      setPet((currentPet) => {
        if (!currentPet) {
          return currentPet;
        }

        return (
          updatedPet ?? {
            ...currentPet,
            imageUrl:
              uploaded.type === "public" ? uploaded.url : currentPet.imageUrl,
            imageFileId:
              uploaded.type === "public"
                ? currentPet.imageFileId
                : uploaded.fileId,
          }
        );
      });
    } catch (error) {
      setAvatarPreviewUrl(null);
      setFormError(
        error instanceof Error
          ? error.message
          : "We could not update the pet avatar right now.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleLostStatusToggle() {
    if (!pet || !canEditPet) {
      return;
    }

    const nextIsLost = !pet.isLost;

    try {
      setUpdatingLostStatus(true);
      setFormError(null);
      const updatedPet = await updatePet(pet.id, { isLost: nextIsLost });
      setPet((currentPet) =>
        updatedPet ??
        (currentPet ? { ...currentPet, isLost: nextIsLost } : currentPet),
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : `We could not mark this pet as ${nextIsLost ? "lost" : "found"} right now.`,
      );
    } finally {
      setUpdatingLostStatus(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb] text-[#1a202c]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10 px-5 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-10 lg:px-14 lg:pt-14 lg:pb-14">
        {publicOwnerInfo ? <OwnerInfoCard owner={publicOwnerInfo} /> : null}

        {appUser ? <PetsQuickNav currentPetId={petId} pets={ownerPets} /> : null}

        <section className="relative min-h-[390px] w-full overflow-hidden rounded-[18px] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus-within:ring-2 focus-within:ring-[#d68532]/40 focus-within:ring-offset-4 focus-within:ring-offset-[#fcf5eb] sm:p-8 md:px-7">
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[176px_minmax(0,1fr)]">
              <div className="min-w-0 overflow-x-auto pb-7 md:col-span-2 xl:col-start-2 xl:col-span-1">
                <div
                  role="tablist"
                  aria-label="Pet detail tabs"
                  className="flex min-w-max items-end gap-10 sm:gap-12 lg:gap-14"
                >
                  {visiblePetDetailsTabs.map((tab) => {
                    const isActive = tab.id === "details";

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-disabled={
                          tab.id !== "details" && tab.id !== "calendar"
                        }
                        className={tabClassName(isActive)}
                        onClick={() => handleTabClick(tab.id)}
                      >
                        {tab.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute right-0 bottom-0 left-0 h-[2px] origin-left rounded-full bg-[#ff8a24] transition-transform duration-200",
                            isActive ? "scale-x-100" : "scale-x-0",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {loadingPet ? (
                <div className="flex min-h-[360px] items-center justify-center pt-12 md:col-span-2 xl:col-start-2 xl:col-span-1">
                  <Spinner label="Loading pet details..." />
                </div>
              ) : loadError ? (
                <div className="pt-12 text-center text-sm font-medium text-[#b91c1c] md:col-span-2 xl:col-start-2 xl:col-span-1">
                  {loadError}
                </div>
              ) : !pet ? (
                <div className="pt-12 text-center text-sm font-medium text-[#1a202c] md:col-span-2 xl:col-start-2 xl:col-span-1">
                  Pet not found.
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="min-w-0 space-y-6 pt-12 md:col-span-2 md:row-start-2 md:grid md:grid-cols-[180px_174px_minmax(0,1fr)_174px] md:gap-x-10 md:gap-y-6 md:space-y-0 md:pt-0 xl:grid-cols-[176px_174px_174px_minmax(0,1fr)] xl:gap-x-[50px]"
                >
                  <aside className="flex flex-col items-center gap-11 md:col-start-1 md:row-start-1 md:row-end-5 md:items-start md:gap-11 xl:gap-11">
                    <button
                      type="button"
                      disabled={!canEditPet}
                      className={cn(
                        "flex h-[292px] w-[176px] items-center justify-center overflow-hidden rounded-[14px] border bg-white transition focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none md:h-[260px] md:w-[180px] md:border-[4px] xl:h-[292px] xl:w-[176px] xl:border",
                        canEditPet
                          ? "hover:brightness-95"
                          : "cursor-default",
                      )}
                      style={{ borderColor: getColorForPet(pet.themeColor) }}
                      onClick={() => {
                        if (canEditPet) {
                          fileInputRef.current?.click();
                        }
                      }}
                      title={canEditPet ? "Change pet avatar" : "Pet avatar"}
                    >
                      {avatarPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarPreviewUrl}
                          alt={`${pet.name} avatar preview`}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : pet.imageFileId ? (
                        <PrivateImage
                          fileId={pet.imageFileId}
                          alt={
                            pet.description ?? `${pet.name} pet profile photo`
                          }
                          className="h-full w-full object-cover object-center"
                          fallbackSrc={fallbackPetImageSrc}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pet.imageUrl ?? fallbackPetImageSrc}
                          alt={
                            pet.description ?? `${pet.name} pet profile photo`
                          }
                          className="h-full w-full object-cover object-center"
                        />
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                    />

                    {canEditPet ? (
                      <button
                        type="button"
                        disabled={uploadingAvatar}
                        className="inline-flex min-h-[60px] w-[176px] items-center justify-center gap-2 rounded-[14px] bg-[#ff8a24] px-5 text-[1.05rem] font-medium text-white transition hover:bg-[#e87918] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 md:w-[180px] xl:w-[176px]"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingAvatar ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                            />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Camera className="h-6 w-6" aria-hidden="true" />
                            {pet.imageFileId || pet.imageUrl
                              ? "Change Avatar"
                              : "Pet Avatar"}
                          </>
                        )}
                      </button>
                    ) : null}
                  </aside>

                  <TextField
                    id="pet-name"
                    label="name"
                    name="name"
                    value={formState.name}
                    className="md:col-start-2 md:row-start-1 md:mt-6 xl:mt-8"
                    editable={canEditPet}
                    onBlur={() => void savePetDetails("name")}
                    onChange={updateFormField}
                  />
                  <TextField
                    id="pet-birth-date"
                    label="date of birth"
                    name="birthDate"
                    value={formState.birthDate}
                    className="md:col-start-4 md:row-start-1 md:mt-6 xl:col-start-3 xl:mt-8"
                    editable={canEditPet}
                    inputMode="numeric"
                    onBlur={() => void savePetDetails("birthDate")}
                    onChange={updateFormField}
                  />
                  <SelectField
                    id="pet-species"
                    label="species"
                    name="species"
                    options={speciesOptions}
                    value={formState.species}
                    className="md:col-start-2 md:col-end-5 md:row-start-2 xl:col-end-4"
                    editable={canEditPet}
                    onBlur={() => void savePetDetails("species")}
                    onChange={updateFormField}
                  />
                  <SelectField
                    id="pet-breed"
                    label="breed"
                    name="breed"
                    options={getBreedOptionsForSpecies(formState.species)}
                    value={formState.breed}
                    className="md:col-start-2 md:col-end-5 md:row-start-3 xl:col-end-4"
                    editable={canEditPet}
                    onBlur={() => void savePetDetails("breed")}
                    onChange={updateFormField}
                  />
                  <SelectField
                    id="pet-gender"
                    label="gender"
                    name="gender"
                    options={genderOptions}
                    value={formState.gender}
                    className="md:col-start-2 md:col-end-5 md:row-start-4 xl:col-end-4"
                    editable={canEditPet}
                    onBlur={() => void savePetDetails("gender")}
                    onChange={updateFormField}
                  />
                  <TextField
                    id="pet-chip"
                    label="chip"
                    name="microchipId"
                    value={formState.microchipId}
                    className="md:col-start-1 md:col-end-5 md:row-start-5 xl:col-start-4 xl:col-end-5 xl:row-start-1 xl:mt-8"
                    editable={canEditPet}
                    onBlur={() => void savePetDetails("microchipId")}
                    onChange={updateFormField}
                  />
                  <SelectField
                    id="pet-weight"
                    label="weight"
                    name="weight"
                    options={weightOptions}
                    value={formState.weight}
                    className="md:col-start-1 md:col-end-5 md:row-start-6 xl:col-start-4 xl:col-end-5 xl:row-start-2"
                    editable={canEditPet}
                    onBlur={() => void savePetDetails("weight")}
                    onChange={updateFormField}
                  />
                  <SelectField
                    id="pet-color"
                    label="color"
                    name="color"
                    options={colorOptions}
                    value={formState.color}
                    className="md:col-start-1 md:col-end-5 md:row-start-7 xl:col-start-4 xl:col-end-5 xl:row-start-3"
                    editable={canEditPet}
                    onBlur={() => void savePetDetails("color")}
                    onChange={updateFormField}
                  />

                  <CheckboxField
                    id="pet-ready-for-adoption"
                    label="Ready for Adoption"
                    name="isAdoptable"
                    checked={formState.isAdoptable}
                    className="md:col-start-1 md:col-end-5 md:row-start-8 xl:col-start-4 xl:col-end-5 xl:row-start-4"
                    editable={canEditPet}
                    onChange={updateAdoptionStatus}
                  />

                  {canEditPet ? (
                    <div className="space-y-3 md:col-start-1 md:col-end-5 md:row-start-9 xl:col-start-4 xl:col-end-5 xl:row-start-5">
                      <p className="text-[0.98rem] leading-none font-medium text-[#1a202c]">
                        press immidiatly if you lost your pet
                      </p>
                      <button
                        type="button"
                        disabled={updatingLostStatus}
                        className="flex h-[60px] w-full items-center justify-center rounded-[14px] border border-[#1a202c] bg-[#ff5277] px-5 text-center text-[1rem] font-medium text-[#1a1720] transition hover:bg-[#f5476f] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={handleLostStatusToggle}
                      >
                        {updatingLostStatus
                          ? pet.isLost
                            ? "Marking found..."
                            : "Marking lost..."
                          : pet.isLost
                            ? "Mark as Found"
                            : "Lost my pet"}
                      </button>
                    </div>
                  ) : null}

                  <div className="min-h-5 text-right text-sm font-medium md:col-start-1 md:col-end-5 md:row-start-10 xl:col-start-2 xl:col-end-5 xl:row-start-6">
                    {formError ? (
                      <p className="text-[#b91c1c]">{formError}</p>
                    ) : saveStatus === "saving" ? (
                      <p className="text-[#4d443d]">Saving...</p>
                    ) : saveStatus === "saved" ? (
                      <p className="text-[#15803d]">Saved</p>
                    ) : null}
                  </div>
                </form>
              )}
            </div>
          </section>
      </div>
    </section>
  );
}
