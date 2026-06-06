export type CalendarEventType =
  | 'vaccination'
  | 'vet_visit'
  | 'checkup'
  | 'grooming'
  | 'medication'
  | 'other';

export interface CalendarEvent {
  id: string;
  petId: string;
  ownerId: string;
  vetId?: string;
  title: string;
  date: string;
  eventType: CalendarEventType;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCalendarEventInput {
  petId: string;
  title: string;
  date: string;
  eventType?: CalendarEventType;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

export interface UpdateCalendarEventInput {
  title?: string;
  date?: string;
  eventType?: CalendarEventType;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

export interface GetCalendarEventsQuery {
  month?: number;
  year?: number;
  petId?: string;
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  vaccination: 'Vaccination',
  vet_visit: 'Vet Visit',
  checkup: 'Checkup',
  grooming: 'Grooming',
  medication: 'Medication',
  other: 'Other',
};

export {
  PET_COLOR_NONE,
  PET_COLOR_THEME_MAP,
  getColorForPet,
} from "@/features/pets/pet-theme-colors";
