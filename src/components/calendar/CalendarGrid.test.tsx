import { fireEvent, render, screen, within } from "@testing-library/react";
import type { CalendarEvent } from "@/features/calendar/calendar.types";
import type { Pet } from "@/types";
import { CalendarGrid } from "./CalendarGrid";

function makePet(id: string, name: string): Pet {
  return {
    id,
    ownerId: "owner-1",
    name,
    species: "Dog",
    isLost: false,
    isAdoptable: false,
    verificationStatus: "unverified",
    publicQrId: `${id}-qr`,
  };
}

function makeEvent(
  overrides: Partial<CalendarEvent> = {},
): CalendarEvent {
  return {
    id: "event-1",
    ownerId: "owner-1",
    petId: "pet-1",
    title: "Vaccination",
    date: new Date(2026, 5, 13, 9).toISOString(),
    eventType: "vaccination",
    ...overrides,
  };
}

function getDayCell(day: string) {
  const cell = screen.getByText(day).closest("div");
  if (!cell) {
    throw new Error(`Expected day ${day} to be rendered.`);
  }

  return cell;
}

describe("CalendarGrid", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 13, 12));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("generates the correct month grid", () => {
    render(
      <CalendarGrid year={2024} month={2} events={[]} pets={[]} />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("29")).toBeInTheDocument();
    expect(screen.queryByText("30")).not.toBeInTheDocument();
  });

  it("displays events on the correct days", () => {
    const event = makeEvent({ title: "Annual checkup" });
    render(
      <CalendarGrid
        year={2026}
        month={6}
        events={[event]}
        pets={[makePet("pet-1", "Milo")]}
      />,
    );

    expect(within(getDayCell("13")).getByText("Annual checkup")).toBeInTheDocument();
    expect(within(getDayCell("14")).queryByText("Annual checkup")).not.toBeInTheDocument();
  });

  it("calls the correct handlers for day and event clicks", () => {
    const event = makeEvent();
    const onDayClick = jest.fn();
    const onEventClick = jest.fn();
    render(
      <CalendarGrid
        year={2026}
        month={6}
        events={[event]}
        pets={[makePet("pet-1", "Milo")]}
        onDayClick={onDayClick}
        onEventClick={onEventClick}
      />,
    );

    fireEvent.click(screen.getByText("Vaccination"));
    expect(onEventClick).toHaveBeenCalledWith(event);
    expect(onDayClick).not.toHaveBeenCalled();

    fireEvent.click(getDayCell("14"));
    expect(onDayClick).toHaveBeenCalledWith(new Date(2026, 5, 14));
  });

  it("highlights the current date when it is in the visible month", () => {
    render(
      <CalendarGrid year={2026} month={6} events={[]} pets={[]} />,
    );

    expect(screen.getByText("13")).toHaveAttribute("aria-current", "date");
  });
});
