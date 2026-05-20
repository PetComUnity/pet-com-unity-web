import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const serifButtonStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
};

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
          "h-12 w-full appearance-none rounded-[1rem] border border-[#364153] bg-white px-4 pr-12 text-[0.98rem] text-[#263043] transition outline-none sm:h-[3.15rem]",
          "invalid:text-[#b8bec8] focus:border-[#364153] focus:ring-2 focus:ring-[#364153]/10",
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
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#364153]" />
    </div>
  );
}

export function AdoptionSearchForm({ className }: { className?: string }) {
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
        className="pointer-events-none absolute top-0 left-1/2 z-10 w-[88%] max-w-[19.8rem] -translate-x-1/2"
      />

      <div className="rounded-[1.5rem] bg-white px-6 pt-7 pb-6 shadow-[0_20px_45px_rgba(31,29,26,0.18)] ring-1 ring-black/5 sm:px-6 sm:pt-8 sm:pb-6">
        <div className="space-y-4 text-[#010101]">
          <div className="space-y-3">
            <h2 className="text-[1.15rem] leading-[1.15] font-semibold tracking-[-0.04em] text-[#232d40] sm:text-[1.25rem]">
              Help you make a choice
            </h2>
            <p className="max-w-[16rem] text-[0.9rem] leading-7 text-[#1e293b]">
              Do you have any idea of who you want to adopt?
            </p>
          </div>

          <form className="space-y-3.5 pt-1">
            {selectFields.map((field) => (
              <HeroSelect key={field.id} {...field} />
            ))}

            <button
              type="button"
              style={serifButtonStyle}
              className="mt-2 inline-flex h-[3.75rem] w-full items-center justify-center rounded-[1rem] border border-[#364153] bg-[#8df86e] text-[1.2rem] font-medium text-[#111111] transition hover:bg-[#6bb556] focus-visible:ring-2 focus-visible:ring-[#364153]/20 focus-visible:outline-none"
            >
              Find
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
