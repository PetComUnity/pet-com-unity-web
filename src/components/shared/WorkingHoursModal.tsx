"use client";

import { useState, useEffect } from "react";

export type DayHours = {
  start: string | null;
  end: string | null;
};

export type WorkingHours = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

export type Props = {
  isOpen: boolean;
  value: WorkingHours;
  onClose: () => void;
  onSave: (value: WorkingHours) => void;
};

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export function WorkingHoursModal({
  isOpen,
  value,
  onClose,
  onSave,
}: Props) {
  const [hours, setHours] = useState<WorkingHours>(value);

  // Sync internal state when the modal receives a new value prop
  useEffect(() => {
    setHours(value);
  }, [value]);

  if (!isOpen) return null;

  const updateDay = (
    day: keyof WorkingHours,
    field: "start" | "end",
    fieldValue: string
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        start: prev[day]?.start ?? null,
        end: prev[day]?.end ?? null,
        [field]: fieldValue,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-6 text-lg font-semibold">
          Operating Hours
        </h3>

        <div className="space-y-3">
          {DAYS.map((day) => (
            <div
              key={day}
              className="grid grid-cols-[120px_1fr_1fr] items-center gap-3"
            >
              <span className="capitalize text-sm font-medium">
                {day}
              </span>

              <input
                type="time"
                value={hours[day]?.start ?? ""}
                onChange={(e) =>
                  updateDay(day, "start", e.target.value)
                }
                className="h-10 rounded-xl border px-3"
              />

              <input
                type="time"
                value={hours[day]?.end ?? ""}
                onChange={(e) =>
                  updateDay(day, "end", e.target.value)
                }
                className="h-10 rounded-xl border px-3"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border px-4"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onSave(hours);
              onClose();
            }}
            className="h-10 rounded-xl bg-[#8df86e] px-4 font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}