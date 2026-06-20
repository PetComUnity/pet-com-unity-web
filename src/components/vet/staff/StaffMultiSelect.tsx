"use client";

interface Props {
  label: string;
  options: string[];
  values: string[];
  onChange: (value: string[]) => void;
}

export default function StaffMultiSelect({
  label,
  options,
  values,
  onChange,
}: Props) {
  const toggle = (item: string) => {
    if (values.includes(item)) {
      onChange(
        values.filter(
          (value) => value !== item
        )
      );

      return;
    }

    onChange([...values, item]);
  };

  return (
    <div>
      <label className="mb-2 block font-medium">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className={`
              rounded-full
              border
              px-4
              py-2
              text-sm
              ${
                values.includes(item)
                  ? "bg-[#ff8a24] text-white"
                  : "bg-white"
              }
            `}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}