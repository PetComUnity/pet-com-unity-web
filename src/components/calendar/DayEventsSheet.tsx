"use client";

import { X } from "lucide-react";
import { CalendarEvent } from "@/features/calendar/calendar.types";
import { Pet } from "@/types";
import { EventCard } from "./EventCard";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DayEventsSheetProps {
  date: Date;
  events: CalendarEvent[];
  pets: Pet[];
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => Promise<void>;
  onAdd: () => void;
}

export function DayEventsSheet({
  date,
  events,
  pets,
  onClose,
  onEdit,
  onDelete,
  onAdd,
}: DayEventsSheetProps) {
  const label = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(122,120,120,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[480px] rounded-t-[1.5rem] bg-white shadow-[0_20px_45px_rgba(31,29,26,0.18)] sm:rounded-[1.5rem]">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#e8e8e8]" />
        </div>

        <div className="flex items-center justify-between px-5 pt-4 pb-2 sm:pt-5">
          <span className="font-display text-xl font-bold text-[var(--primary-text)]">
            {label}
          </span>
          <button
            onClick={onClose}
            className="text-[#969696] transition-colors hover:text-[var(--primary-text)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto px-5 pb-2">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              pets={pets}
              onDelete={async (id) => {
                await onDelete(id);
              }}
              onEdit={(ev) => {
                onClose();
                onEdit(ev);
              }}
            />
          ))}
        </div>

        <div className="px-5 pt-3 pb-6">
          <button
            onClick={onAdd}
            className="font-display inline-flex h-[61px] w-full items-center justify-center rounded-[1rem] border border-[var(--input-border)] bg-[var(--greenaccent)] text-base font-bold text-[var(--primary-text)] transition hover:brightness-95"
          >
            Add event
          </button>
        </div>
      </div>
    </div>
  );
}
