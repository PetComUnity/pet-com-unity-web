"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import {
  ADOPTION_ANIMAL_OPTIONS,
  ADOPTION_SIZE_OPTIONS,
  DEFAULT_ADOPTION_SEARCH_FILTERS,
  type AdoptionSearchFilters,
} from "@/features/pets/adoption-search";
import { cn } from "@/lib/utils";

const selectFields = [
  {
    id: "animal",
    label: "Animal",
    emptyOptionLabel: "All animals",
    options: ADOPTION_ANIMAL_OPTIONS,
  },
  {
    id: "size",
    label: "Size",
    emptyOptionLabel: "All sizes",
    options: ADOPTION_SIZE_OPTIONS,
  },
] as const;

function HeroTextInput({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: "location";
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-12 w-full rounded-[1rem] border border-[#364153] bg-white px-4 text-[0.98rem] text-[#263043] transition outline-none sm:h-[3.15rem]",
          "placeholder:text-[#b8bec8] focus:border-[#364153] focus:ring-2 focus:ring-[#364153]/10",
        )}
      />
    </div>
  );
}

function HeroSelect({
  id,
  label,
  options,
  value,
  emptyOptionLabel,
  onChange,
}: {
  id: keyof AdoptionSearchFilters;
  label: string;
  options: ReadonlyArray<Readonly<{ label: string; value: string }>>;
  value: string;
  emptyOptionLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-12 w-full appearance-none rounded-[1rem] border border-[#364153] bg-white px-4 pr-12 text-[0.98rem] text-[#263043] transition outline-none sm:h-[3.15rem]",
          "focus:border-[#364153] focus:ring-2 focus:ring-[#364153]/10",
        )}
      >
        <option value="">{emptyOptionLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#364153]" />
    </div>
  );
}

export function AdoptionSearchForm({
  className,
  filters = DEFAULT_ADOPTION_SEARCH_FILTERS,
  isSearching = false,
  onSearch,
}: {
  className?: string;
  filters?: AdoptionSearchFilters;
  isSearching?: boolean;
  onSearch?: (filters: AdoptionSearchFilters) => void;
}) {
  const filterKey = `${filters.animal}:${filters.size}:${filters.location}`;
  const [draftState, setDraftState] = useState(() => ({
    filterKey,
    filters,
  }));
  const draftFilters =
    draftState.filterKey === filterKey ? draftState.filters : filters;

  function updateFilter(field: keyof AdoptionSearchFilters, value: string) {
    const nextFilters =
      field === "animal"
        ? { ...draftFilters, animal: value }
        : field === "size"
          ? { ...draftFilters, size: value as AdoptionSearchFilters["size"] }
          : { ...draftFilters, location: value };

    setDraftState({
      filterKey,
      filters: nextFilters,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(draftFilters);
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[21.75rem] pt-[4.5rem] sm:max-w-[22.25rem] sm:pt-[5rem] lg:max-w-[22.5rem]",
        className,
      )}
    >
      <Image
        src="/images/animals.png"
        alt=""
        width={359}
        height={137}
        aria-hidden="true"
        className="pointer-events-none absolute top-[0rem] left-1/2 z-10 w-[88%] max-w-[19.8rem] -translate-x-1/2 sm:top-1"
      />

      <div className="rounded-[1.5rem] bg-white px-6 pt-7 pb-6 shadow-[0_20px_45px_rgba(31,29,26,0.18)] ring-1 ring-black/5 sm:px-6 sm:pt-8 sm:pb-6">
        <div className="space-y-4 text-[#010101]">
          <div className="space-y-3 font-sans">
            <h2 className="text-[1.15rem] leading-[1.15] font-semibold tracking-[-0.04em] text-[#232d40] sm:text-[1.25rem]">
              Help you make a choice
            </h2>
            <p className="max-w-[16rem] text-[0.9rem] leading-7 text-[#1e293b]">
              Do you have any idea of who you want to adopt?
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            aria-busy={isSearching}
            className="space-y-3.5 pt-1 font-sans"
          >
            {selectFields.map((field) => (
              <HeroSelect
                key={field.id}
                {...field}
                value={draftFilters[field.id]}
                onChange={(value) => updateFilter(field.id, value)}
              />
            ))}
            <HeroTextInput
              id="location"
              label="Location"
              value={draftFilters.location}
              placeholder="Any location"
              onChange={(value) => updateFilter("location", value)}
            />

            <button
              type="submit"
              disabled={isSearching}
              className={cn(
                "mt-2 inline-flex h-[3.75rem] w-full items-center justify-center rounded-[1rem] border border-[#364153] bg-[#8df86e] text-[1.2rem] font-medium text-[#111111] transition focus-visible:ring-2 focus-visible:ring-[#364153]/20 focus-visible:outline-none",
                isSearching ? "cursor-wait opacity-80" : "hover:bg-[#6bb556]",
              )}
            >
              {isSearching ? (
                <span className="inline-flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin rounded-full border-2 border-[#17243b]/30 border-t-[#17243b]"
                  />
                  Filtering...
                </span>
              ) : (
                "Find"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
