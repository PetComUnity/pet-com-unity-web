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

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  vaccination: '#f38c2c',
  vet_visit:   '#ff5b7e',
  checkup:     '#0085ff',
  grooming:    '#00ba34',
  medication:  '#a855f7',
  other:       '#14b8a6',
};

export function getEventTypeColor(eventType?: CalendarEventType): string {
  if (!eventType) return EVENT_TYPE_COLORS.other;
  return EVENT_TYPE_COLORS[eventType] ?? EVENT_TYPE_COLORS.other;
}

export const PET_COLORS = [
  '#0085ff',
  '#00ba34',
  '#ff5b7e',
  '#f38c2c',
  '#a855f7',
  '#14b8a6',
];

export function getPetColor(index: number): string {
  return PET_COLORS[index % PET_COLORS.length];
}
