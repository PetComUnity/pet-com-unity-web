"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, MapPin, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Pet } from "@/types";
import {
  CalendarEvent,
  CalendarEventType,
  CreateCalendarEventInput,
  EVENT_TYPE_LABELS,
  UpdateCalendarEventInput,
} from "@/features/calendar/calendar.types";

interface AddEventModalProps {
  pets: Pet[];
  initialDate?: Date;
  editEvent?: CalendarEvent;
  onClose: () => void;
  onSave: (input: CreateCalendarEventInput) => Promise<void>;
  onUpdate?: (id: string, input: UpdateCalendarEventInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

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

const EVENT_TYPES = Object.entries(EVENT_TYPE_LABELS) as [
  CalendarEventType,
  string,
][];

function formatDisplayDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function toDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface NominatimItem {
  display_name: string;
  name?: string;
  address?: Record<string, string>;
}

function formatNominatimResult(item: NominatimItem): string {
  const addr = item.address ?? {};
  // Named POI (vet clinic, hospital, park, etc.)
  const poi =
    addr.amenity ??
    addr.clinic ??
    addr.veterinary ??
    addr.shop ??
    addr.leisure ??
    item.name ??
    "";
  const city =
    addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? "";
  const district = addr.city_district ?? addr.suburb ?? "";

  if (poi && city) return `${poi}, ${city}`;
  if (poi && district) return `${poi}, ${district}`;
  if (poi) return poi;
  if (city && district) return `${district}, ${city}`;
  if (city) return city;
  // Fallback: first two meaningful parts of display_name
  return item.display_name.split(", ").slice(0, 2).join(", ");
}

const inputClass =
  "h-11 w-full appearance-none rounded-[1rem] border border-[var(--input-border)] bg-white px-4 font-sans text-sm font-medium leading-5 text-[var(--primary-text)] outline-none transition placeholder:text-[#7A7878]/50 hover:border-[#7A7878] focus:border-[var(--input-border)] focus:ring-2 focus:ring-[var(--input-border)]/10";

export function AddEventModal({
  pets,
  initialDate,
  editEvent,
  onClose,
  onSave,
  onUpdate,
  onDelete,
}: AddEventModalProps) {
  const isEdit = Boolean(editEvent);
  const defaultDate = editEvent
    ? new Date(editEvent.date)
    : (initialDate ?? new Date());

  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [title, setTitle] = useState(editEvent?.title ?? "");
  const [petId, setPetId] = useState(editEvent?.petId ?? "");
  const [eventType, setEventType] = useState<CalendarEventType | "">(
    editEvent?.eventType ?? "",
  );
  const [startTime, setStartTime] = useState(editEvent?.startTime ?? "");
  const [endTime, setEndTime] = useState(editEvent?.endTime ?? "");
  const [location, setLocation] = useState(editEvent?.location ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const locationWrapRef = useRef<HTMLDivElement>(null);
  const locationTouched = useRef(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        locationWrapRef.current &&
        !locationWrapRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!locationTouched.current || location.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=7&addressdetails=1&countrycodes=ua&accept-language=uk`,
          { signal: abortRef.current.signal },
        );
        const data: NominatimItem[] = await res.json();
        const names = data
          .map((item) => formatNominatimResult(item))
          .filter(Boolean) as string[];
        const unique = [...new Set(names)];
        setSuggestions(unique);
        setShowSuggestions(unique.length > 0);
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [location]);

  async function handleDelete() {
    if (!editEvent || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(editEvent.id);
      toast.success("Event deleted.");
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Enter the event name");
      return;
    }
    if (!isEdit && !petId) {
      setError("Choose an animal");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const isoDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startTime ? parseInt(startTime.split(":")[0]) : 0,
        startTime ? parseInt(startTime.split(":")[1] ?? "0") : 0,
      ).toISOString();

      if (isEdit && editEvent && onUpdate) {
        await onUpdate(editEvent.id, {
          title: title.trim(),
          date: isoDate,
          eventType: eventType || undefined,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          location: location.trim() || undefined,
        });
        toast.success("Event updated.");
      } else {
        await onSave({
          petId,
          title: title.trim(),
          date: isoDate,
          eventType: eventType || undefined,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          location: location.trim() || undefined,
        });
        toast.success("Event created.");
      }
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "rgba(122,120,120,0.5)" }}
    >
      <div
        className="flex min-h-full items-center justify-center px-4 py-8"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-[360px]">
          <div
            className="relative z-20 w-full"
            style={{ aspectRatio: "360 / 137" }}
          >
            <Image
              src="/images/calendar-animals.png"
              fill
              sizes="(max-width: 392px) calc(100vw - 32px), 360px"
              alt=""
              priority
              className="pointer-events-none object-cover object-top"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 bottom-[-4px] z-20 flex h-[24px] w-[24px] items-center justify-center bg-[#f38c2c] transition-opacity hover:opacity-85 md:h-[30px] md:w-[30px]"
              aria-label="Close"
            >
              <X
                className="h-6 w-6 text-white md:h-8 md:w-8"
                strokeWidth={2.5}
              />
            </button>
          </div>

          <div className="relative z-10 -mt-10 rounded-[1.5rem] bg-white shadow-[0_20px_45px_rgba(31,29,26,0.18)] ring-1 ring-black/5 min-[375px]:-mt-12">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 px-6 pt-8 pb-6 min-[375px]:pt-10"
            >
              <div className="flex items-center">
                <button
                  type="button"
                  className="flex items-center gap-1.5"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                >
                  <span className="font-display text-xl font-bold text-[var(--primary-text)]">
                    {formatDisplayDate(selectedDate)}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--primary-text)]" />
                </button>
              </div>

              <input
                ref={dateInputRef}
                type="date"
                value={toDateInput(selectedDate)}
                onChange={(e) => {
                  if (e.target.value)
                    setSelectedDate(new Date(e.target.value + "T00:00:00"));
                }}
                className="sr-only"
                tabIndex={-1}
              />

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the event name"
                  className={inputClass}
                />

                <div className="relative">
                  <select
                    value={eventType}
                    onChange={(e) =>
                      setEventType(e.target.value as CalendarEventType | "")
                    }
                    className={`${inputClass} pr-10 [&>option]:text-[var(--primary-text)] ${!eventType ? "!text-[#7A7878]/50" : ""}`}
                  >
                    <option value="" disabled>
                      Choose event type
                    </option>
                    {EVENT_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[var(--primary-text)]" />
                </div>

                {!isEdit && (
                  <div className="relative">
                    <select
                      value={petId}
                      onChange={(e) => setPetId(e.target.value)}
                      className={`${inputClass} pr-10 [&>option]:text-[var(--primary-text)] ${!petId ? "!text-[#7A7878]/50" : ""}`}
                    >
                      <option value="" disabled>
                        Choose animal
                      </option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[var(--primary-text)]" />
                  </div>
                )}

                <div className="flex w-full flex-col gap-2 rounded-[1rem] border border-[var(--input-border)] px-4 py-2.5 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-0">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 font-sans text-sm font-medium text-[var(--primary-text)]">
                      Start at
                    </span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent font-sans text-sm font-medium text-[var(--primary-text)] outline-none [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:shrink-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-30"
                    />
                  </div>
                  <div className="hidden h-5 w-px bg-[#7A7878]/30 min-[400px]:block" />
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 font-sans text-sm font-medium text-[var(--primary-text)]">
                      End at
                    </span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent font-sans text-sm font-medium text-[var(--primary-text)] outline-none [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:shrink-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-30"
                    />
                  </div>
                </div>

                <div className="relative" ref={locationWrapRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        locationTouched.current = true;
                        setLocation(e.target.value);
                        setShowSuggestions(false);
                      }}
                      onFocus={() =>
                        suggestions.length > 0 && setShowSuggestions(true)
                      }
                      placeholder="Location"
                      className={`${inputClass} pr-11`}
                      autoComplete="off"
                    />
                    <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#7A7878]/50">
                      {loadingSuggestions ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-[1rem] border border-[var(--input-border)] bg-white shadow-lg">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setLocation(s);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-2.5 text-left font-sans text-sm font-medium text-[var(--primary-text)] transition-colors hover:bg-[#fff8f0]"
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {error && (
                <p className="-mt-1 font-sans text-sm text-red-500">{error}</p>
              )}

              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="font-display inline-flex h-11 w-full items-center justify-center gap-2 rounded-[1rem] border border-red-300 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60 md:text-base"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting…" : "Delete event"}
                </button>
              )}

              <button
                type="submit"
                disabled={saving || deleting}
                className="font-display inline-flex h-[61px] w-full items-center justify-center rounded-[1rem] border border-[var(--input-border)] bg-[var(--greenaccent)] text-base font-bold text-[var(--primary-text)] transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[var(--input-border)]/20 focus-visible:outline-none disabled:opacity-60 md:text-2xl"
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Add event"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
