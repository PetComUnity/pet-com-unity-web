"use client";

import {
  CalendarEvent,
  getColorForPet,
} from "@/features/calendar/calendar.types";
import { Pet } from "@/types";
import { CalendarEventChip } from "./CalendarEventChip";

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  pets: Pet[];
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isSameDay(
  date: Date,
  year: number,
  month: number,
  day: number,
): boolean {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function CalendarGrid({
  year,
  month,
  events,
  pets,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  const days = buildCalendarDays(year, month);
  const today = new Date();

  function getEventsForDay(day: number): CalendarEvent[] {
    return events.filter((e) => isSameDay(new Date(e.date), year, month, day));
  }

  function getThemeColorForEvent(event: CalendarEvent): string {
    const pet = pets.find((p) => p.id === event.petId);
    return getColorForPet(pet?.themeColor);
  }

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month - 1 &&
    today.getDate() === day;

  return (
    <div
      className="grid grid-cols-7 gap-[1px] overflow-hidden rounded-lg bg-[#e8e8e8]"
      style={{ filter: "drop-shadow(0px 1px 0.5px rgba(0,0,0,0.12))" }}
    >
      {WEEKDAYS.map((wd, i) => (
        <div key={wd} className="bg-white p-3">
          <span className="hidden font-sans text-[14px] font-medium text-[#969696] md:block">
            {wd}
          </span>
          <span className="font-sans text-xs font-medium text-[#969696] md:hidden">
            {WEEKDAYS_SHORT[i]}
          </span>
        </div>
      ))}

      {days.map((day, idx) => {
        const dayEvents = day ? getEventsForDay(day) : [];
        return (
          <div
            key={idx}
            className={[
              "flex flex-col justify-between bg-white",
              "md:min-h-[140px] md:px-[10px] md:py-[6px]",
              "min-h-[56px] px-1 py-1",
              day && onDayClick ? "cursor-pointer hover:bg-[#fffaf5]" : "",
            ].join(" ")}
            onClick={() => {
              if (day && onDayClick) onDayClick(new Date(year, month - 1, day));
            }}
          >
            {day && (
              <>
                <span
                  className={[
                    "self-start font-sans leading-none font-medium",
                    "md:text-[16px] md:text-[#969696]",
                    "text-xs text-[#969696]",
                    isToday(day)
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#f38c2c] text-[10px] !text-white md:h-7 md:w-7"
                      : "",
                  ].join(" ")}
                  aria-current={isToday(day) ? "date" : undefined}
                >
                  {day}
                </span>

                <div className="mt-1 flex w-full flex-col gap-[3px]">
                  <div className="hidden w-full flex-col gap-[5px] md:flex">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(ev);
                        }}
                      >
                        <CalendarEventChip
                          title={ev.title}
                          color={getThemeColorForEvent(ev)}
                        />
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="pl-1 font-sans text-xs text-[#969696]">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-0.5 flex flex-wrap gap-0.5 md:hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: getThemeColorForEvent(ev) }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="h-1.5 w-1.5 rounded-full bg-[#969696]" />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
