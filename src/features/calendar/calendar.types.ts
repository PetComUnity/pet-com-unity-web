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


export const PET_COLOR_THEME_MAP: Record<string, string> = {
  Red:    '#ef4444',
  Orange: '#f97316',
  Yellow: '#eab308',
  Green:  '#22c55e',
  Teal:   '#14b8a6',
  Blue:   '#3b82f6',
  Purple: '#a855f7',
  Pink:   '#ec4899',
  Brown:  '#92400e',
};

export const PET_COLOR_NONE = '#9ca3af';

export function getColorForPet(themeColor: string | undefined): string {
  if (!themeColor || themeColor === 'None') return PET_COLOR_NONE;
  return PET_COLOR_THEME_MAP[themeColor] ?? PET_COLOR_NONE;
}
