"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EventCard } from "@/components/calendar/EventCard";
import { PetAvatarFilter } from "@/components/calendar/PetAvatarFilter";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import { DayEventsSheet } from "@/components/calendar/DayEventsSheet";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/features/calendar/calendar.service";
import {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/features/calendar/calendar.types";
import { Pet } from "@/types";
import { getMyPets } from "@/features/pets/pet-api.service";

const MONTH_NAMES = [
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

type ViewMode = "upcoming" | "all";
type MobileView = "calendar" | "list";

const segmentLeft = (active: boolean) =>
  `flex-1 h-10 font-display text-base font-medium text-[var(--primary-text)] text-center transition-colors
   rounded-tl-[4px] rounded-bl-[4px] border-t border-b border-l border-[rgba(122,120,120,0.5)]
   ${active ? "bg-[#97ff7b]/40" : "bg-white"}`;

const segmentRight = (active: boolean) =>
  `flex-1 h-10 font-display text-base font-medium text-[var(--primary-text)] text-center transition-colors
   rounded-tr-[4px] rounded-br-[4px] border border-[rgba(122,120,120,0.5)]
   ${active ? "bg-[#97ff7b]/40" : "bg-white"}`;

function MonthNav({
  month,
  year,
  onPrev,
  onNext,
}: {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPrev}
        className="p-1 text-[#f38c2c] transition-opacity hover:opacity-70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <span className="font-display text-base font-bold text-[#f38c2c]">
        {MONTH_NAMES[month - 1]}
      </span>
      <button
        onClick={onNext}
        className="p-1 text-[#f38c2c] transition-opacity hover:opacity-70"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
      <span className="font-display ml-1 text-base font-bold text-[#f38c2c]">
        {year}
      </span>
    </div>
  );
}

const PET_TABS = [
  { label: "My pets", href: ROUTES.pets },
  { label: "My Calendar", href: ROUTES.calendar },
  { label: "Adoption list", href: ROUTES.adoptionList },
] as const;

function tabClassName(isActive: boolean) {
  return cn(
    "relative shrink-0 pb-3 text-left font-display text-[1rem] leading-none tracking-[-0.035em] transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d68532]/40 focus-visible:ring-offset-4",
    "sm:text-[1.5rem] lg:text-[1.75rem]",
    isActive ? "text-[#1f1c19]" : "text-[#4d443d] hover:text-[#1f1c19]",
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [pets, setPets] = useState<Pet[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");
  const [mobileView, setMobileView] = useState<MobileView>("calendar");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | undefined>(undefined);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const hasLoadedOnce = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyPets()
      .then(setPets)
      .catch(() => setPets([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      if (hasLoadedOnce.current) {
        setFetching(true);
      }
      setError("");
      try {
        const data = await getCalendarEvents({
          month,
          year,
          petId: selectedPetId ?? undefined,
        });
        if (!cancelled) setEvents(data);
      } catch (e) {
        if (!cancelled)
          setError((e as Error)?.message ?? "Failed to load events");
      } finally {
        if (!cancelled) {
          hasLoadedOnce.current = true;
          setLoading(false);
          setFetching(false);
        }
      }
    }

    void fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [month, year, selectedPetId]);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function openAddModal(date?: Date) {
    setEditingEvent(undefined);
    setModalDate(date);
    setModalOpen(true);
  }

  function openEditModal(event: CalendarEvent) {
    setEditingEvent(event);
    setModalDate(undefined);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEvent(undefined);
    setModalDate(undefined);
  }

  async function handleSaveEvent(input: CreateCalendarEventInput) {
    const created = await createCalendarEvent(input);
    setEvents((prev) =>
      [...prev, created].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    );
  }

  async function handleUpdateEvent(
    id: string,
    input: UpdateCalendarEventInput,
  ) {
    const updated = await updateCalendarEvent(id, input);
    setEvents((prev) =>
      prev
        .map((e) => (e.id === id ? updated : e))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    );
  }

  async function handleDeleteEvent(id: string) {
    await deleteCalendarEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function getDayEvents(date: Date): CalendarEvent[] {
    return events.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });
  }

  function handleDayClick(date: Date) {
    const dayEvents = getDayEvents(date);
    if (dayEvents.length > 0) {
      setSelectedDay(date);
    } else {
      openAddModal(date);
    }
  }

  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const displayedEvents = viewMode === "upcoming" ? upcomingEvents : events;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fff8f0]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          <div className="mb-6 overflow-x-auto pb-3">
            <div
              role="tablist"
              aria-label="Pet dashboard tabs"
              className="flex min-w-max items-end justify-center gap-8 sm:gap-10 lg:justify-start lg:gap-14"
            >
              {PET_TABS.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <button
                    key={tab.href}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={tabClassName(isActive)}
                    onClick={() => router.push(tab.href)}
                  >
                    {tab.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute right-0 bottom-0 left-0 h-[2px] origin-left rounded-full bg-[#d68532] transition-transform duration-200",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-6 flex items-center justify-center md:justify-between md:pr-4">
            <div className="hidden items-center gap-1 md:flex">
              <button
                onClick={prevMonth}
                className="p-1 text-[#f38c2c] transition-opacity hover:opacity-70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-display text-2xl font-bold text-[#f38c2c]">
                {MONTH_NAMES[month - 1]}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 text-[#f38c2c] transition-opacity hover:opacity-70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="font-display ml-1 text-2xl font-bold text-[#f38c2c]">
                {year}
              </span>
            </div>
            <PetAvatarFilter
              pets={pets}
              selectedPetId={selectedPetId}
              onSelect={setSelectedPetId}
            />
          </div>

          <div className="md:hidden">
            <div className="mb-6 flex">
              <button
                onClick={() => setMobileView("calendar")}
                className={segmentLeft(mobileView === "calendar")}
              >
                Calendar
              </button>
              <button
                onClick={() => setMobileView("list")}
                className={segmentRight(mobileView === "list")}
              >
                Events
              </button>
            </div>

            {mobileView === "calendar" && (
              <>
                <div className="mb-6 flex items-center">
                  <MonthNav
                    month={month}
                    year={year}
                    onPrev={prevMonth}
                    onNext={nextMonth}
                  />
                </div>
                {loading ? (
                  <p className="py-16 text-center font-sans text-[#969696]">
                    Loading…
                  </p>
                ) : error ? (
                  <p className="py-16 text-center font-sans text-red-500">
                    {error}
                  </p>
                ) : (
                  <div className={fetching ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
                    <CalendarGrid
                      year={year}
                      month={month}
                      events={events}
                      pets={pets}
                      onDayClick={handleDayClick}
                      onEventClick={(ev) => openEditModal(ev)}
                    />
                  </div>
                )}
              </>
            )}

            {mobileView === "list" && (
              <>
                <div className="mb-6 flex">
                  <button
                    onClick={() => setViewMode("upcoming")}
                    className={segmentLeft(viewMode === "upcoming")}
                  >
                    upcoming events
                  </button>
                  <button
                    onClick={() => setViewMode("all")}
                    className={segmentRight(viewMode === "all")}
                  >
                    show all
                  </button>
                </div>

                <div className="mb-6 flex items-center">
                  <MonthNav
                    month={month}
                    year={year}
                    onPrev={prevMonth}
                    onNext={nextMonth}
                  />
                </div>

                {loading ? (
                  <p className="py-8 text-center font-sans text-[#969696]">
                    Loading…
                  </p>
                ) : displayedEvents.length === 0 ? (
                  <p className="py-8 text-center font-sans text-[#969696]">
                    No events
                  </p>
                ) : (
                  <div className={`flex flex-col gap-3 ${fetching ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}`}>
                    {displayedEvents.map((ev) => (
                      <EventCard
                        key={ev.id}
                        event={ev}
                        pets={pets}
                        onDelete={handleDeleteEvent}
                        onEdit={openEditModal}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="hidden md:block">
            {loading ? (
              <p className="py-16 text-center font-sans text-[#969696]">
                Loading…
              </p>
            ) : error ? (
              <p className="py-16 text-center font-sans text-red-500">
                {error}
              </p>
            ) : (
              <div className={fetching ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
                <CalendarGrid
                  year={year}
                  month={month}
                  events={events}
                  pets={pets}
                  onDayClick={handleDayClick}
                  onEventClick={(ev) => openEditModal(ev)}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center md:justify-end">
            <button
              onClick={() => openAddModal()}
              className="font-display inline-flex h-[61px] w-full items-center justify-center rounded-[1rem] border border-[var(--input-border)] bg-[var(--greenaccent)] text-base font-bold text-[var(--primary-text)] transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[var(--input-border)]/20 focus-visible:outline-none md:w-auto md:min-w-[200px] md:text-2xl"
            >
              Add event
            </button>
          </div>
        </div>

        {selectedDay && (
          <DayEventsSheet
            date={selectedDay}
            events={getDayEvents(selectedDay)}
            pets={pets}
            onClose={() => setSelectedDay(null)}
            onEdit={(ev) => {
              setSelectedDay(null);
              openEditModal(ev);
            }}
            onDelete={async (id) => {
              await handleDeleteEvent(id);
              setEvents((prev) => {
                const remaining = prev.filter((e) => {
                  const d = new Date(e.date);
                  return (
                    e.id !== id &&
                    d.getFullYear() === selectedDay.getFullYear() &&
                    d.getMonth() === selectedDay.getMonth() &&
                    d.getDate() === selectedDay.getDate()
                  );
                });
                if (remaining.length === 0) setSelectedDay(null);
                return prev.filter((e) => e.id !== id);
              });
            }}
            onAdd={() => {
              setSelectedDay(null);
              openAddModal(selectedDay);
            }}
          />
        )}

        {modalOpen && (
          <AddEventModal
            pets={pets}
            initialDate={modalDate}
            editEvent={editingEvent}
            onClose={closeModal}
            onSave={handleSaveEvent}
            onUpdate={handleUpdateEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
