import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CalendarEvent } from "@/features/calendar/calendar.types";
import { getCalendarEvents } from "@/features/calendar/calendar.service";
import { getMyPets } from "@/features/pets/pet-api.service";
import CalendarPage from "./page";

jest.mock("@/components/layout/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/components/pet/PetDashboardTabs", () => ({
  PetDashboardTabs: () => <nav aria-label="Pet dashboard tabs" />,
}));

jest.mock("@/features/calendar/calendar.service", () => ({
  createCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
  getCalendarEvents: jest.fn(),
  updateCalendarEvent: jest.fn(),
}));

jest.mock("@/features/pets/pet-api.service", () => ({
  getMyPets: jest.fn(),
}));

const mockedGetCalendarEvents = jest.mocked(getCalendarEvents);
const mockedGetMyPets = jest.mocked(getMyPets);

function makeEvent(title: string, date: Date): CalendarEvent {
  return {
    id: title.toLowerCase().replace(/\s+/g, "-"),
    ownerId: "owner-1",
    petId: "pet-1",
    title,
    date: date.toISOString(),
    eventType: "checkup",
  };
}

describe("CalendarPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 13, 12));
    mockedGetMyPets.mockResolvedValue([]);
    mockedGetCalendarEvents.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("handles month and year navigation", async () => {
    mockedGetCalendarEvents.mockImplementation(async (query = {}) => {
      const { month, year } = query;

      if (month === 6 && year === 2026) {
        return [
        makeEvent("June checkup", new Date(2026, 5, 20, 9)),
        ];
      }

      if (month === 7 && year === 2026) {
        return [
        makeEvent("July vaccine", new Date(2026, 6, 5, 9)),
        ];
      }

      if (month === 1 && year === 2027) {
        return [
        makeEvent("January visit", new Date(2027, 0, 8, 9)),
        ];
      }

      return [];
    });

    render(<CalendarPage />);

    expect((await screen.findAllByText("June checkup")).length).toBeGreaterThan(
      0,
    );
    expect(mockedGetCalendarEvents).toHaveBeenCalledWith({
      month: 6,
      petId: undefined,
      year: 2026,
    });

    fireEvent.click(screen.getAllByLabelText("Next month")[0]);

    expect((await screen.findAllByText("July vaccine")).length).toBeGreaterThan(
      0,
    );
    await waitFor(() =>
      expect(mockedGetCalendarEvents).toHaveBeenLastCalledWith({
        month: 7,
        petId: undefined,
        year: 2026,
      }),
    );

    for (let clicks = 0; clicks < 6; clicks += 1) {
      fireEvent.click(screen.getAllByLabelText("Next month")[0]);
    }

    expect(
      (await screen.findAllByText("January visit")).length,
    ).toBeGreaterThan(0);
    await waitFor(() =>
      expect(mockedGetCalendarEvents).toHaveBeenLastCalledWith({
        month: 1,
        petId: undefined,
        year: 2027,
      }),
    );
  });
});
