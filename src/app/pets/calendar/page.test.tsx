import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CalendarEvent } from "@/features/calendar/calendar.types";
import { getCalendarEvents } from "@/features/calendar/calendar.service";
import { getMyPets } from "@/features/pets/pet-api.service";
import type { Pet } from "@/types";
import CalendarPage from "./page";

jest.mock("@/components/layout/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/components/pet/PetDashboardTabs", () => ({
  PetDashboardTabs: () => <nav aria-label="Pet dashboard tabs" />,
}));

jest.mock("@/components/pet/PetAvatarCarousel", () => ({
  PetAvatarCarousel: ({
    pets,
    onSelectPet,
  }: {
    pets: { id: string; name: string }[];
    onSelectPet?: (id: string | null) => void;
  }) => (
    <div>
      {pets.map((p) => (
        <button key={p.id} onClick={() => onSelectPet?.(p.id)}>
          {p.name}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/components/calendar/AddEventModal", () => ({
  AddEventModal: () => <div role="dialog" aria-label="Add event" />,
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

  it("filters events by selected pet", async () => {
    mockedGetMyPets.mockResolvedValue([makePet("pet-1", "Milo")]);
    mockedGetCalendarEvents.mockImplementation(async (query = {}) => {
      if (query.petId === "pet-1") {
        return [makeEvent("Milo checkup", new Date(2026, 5, 20, 9))];
      }
      return [];
    });

    render(<CalendarPage />);

    await waitFor(() =>
      expect(mockedGetCalendarEvents).toHaveBeenCalledWith({
        month: 6,
        year: 2026,
        petId: undefined,
      }),
    );

    fireEvent.click(await screen.findByText("Milo"));

    expect((await screen.findAllByText("Milo checkup")).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(mockedGetCalendarEvents).toHaveBeenLastCalledWith({
        month: 6,
        year: 2026,
        petId: "pet-1",
      }),
    );
  });

  it("opens the add event modal when Add event is clicked", async () => {
    mockedGetCalendarEvents.mockResolvedValue([]);

    render(<CalendarPage />);

    await waitFor(() => expect(mockedGetCalendarEvents).toHaveBeenCalled());

    expect(
      screen.queryByRole("dialog", { name: "Add event" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Add event"));

    expect(screen.getByRole("dialog", { name: "Add event" })).toBeInTheDocument();
  });
});
