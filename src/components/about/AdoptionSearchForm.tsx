import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const selectFields = [
  {
    id: "animal",
    label: "Animal",
    placeholder: "animal",
    options: ["Dog", "Cat", "Rabbit", "Bird"],
  },
  {
    id: "size",
    label: "Size",
    placeholder: "size",
    options: ["Small", "Medium", "Large"],
  },
  {
    id: "location",
    label: "Location",
    placeholder: "location",
    options: ["Skopje", "Bitola", "Ohrid", "Tetovo"],
  },
] as const;

function HeroSelect({
  id,
  label,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue=""
        required
        className={cn(
          "h-14 w-full appearance-none rounded-[1.2rem] border border-[#2c241d] bg-white px-4 pr-12 text-[1.02rem] text-[#3d342d] transition outline-none",
          "invalid:text-[#bbb3ab] focus:border-[#2c241d] focus:ring-2 focus:ring-[#2c241d]/10",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option.toLowerCase()}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#6f665e]" />
    </div>
  );
}

export function AdoptionSearchForm() {
  return (
    <div className="relative mx-auto w-full max-w-[22rem] pt-[4.7rem] sm:max-w-[23rem] sm:pt-[5.4rem]">
      <Image
        src="/images/animals.png"
        alt=""
        width={359}
        height={137}
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-1/2 z-10 w-[89%] max-w-[20rem] -translate-x-1/2"
      />

      <div className="rounded-[1.9rem] bg-white px-6 pb-6 pt-6 shadow-[0_28px_80px_rgba(74,47,13,0.16)] ring-1 ring-black/5 sm:px-7 sm:pb-7 sm:pt-7">
        <div className="space-y-4 text-[#010101]">
          <div className="space-y-3">
            <h1 className="text-[1.25rem] font-semibold leading-[1.05] tracking-[-0.04em]">
              Help you make a choice
            </h1>
            <p className="max-w-[16rem] text-[0.9rem] text-[#010101]">
              Do you have any idea of who you want to adopt?
            </p>
          </div>

          <form className="space-y-4 pt-1">
            {selectFields.map((field) => (
              <HeroSelect key={field.id} {...field} />
            ))}

            <button
              type="button"
              className="mt-2 inline-flex h-[3.7rem] w-full items-center justify-center rounded-[1.15rem] border border-[#2c241d] bg-[#8df86e] text-[1.05rem] font-semibold text-[#111111] transition hover:bg-[#6bb556] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c241d]/20"
            >
              Find
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
