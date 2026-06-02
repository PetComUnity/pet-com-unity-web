import { apiRequest } from '@/lib/api';
import { getToken } from '@/features/auth/auth.service';
import {
  CalendarEvent,
  CreateCalendarEventInput,
  GetCalendarEventsQuery,
  UpdateCalendarEventInput,
} from './calendar.types';

function buildQuery(params: GetCalendarEventsQuery): string {
  const query = new URLSearchParams();
  if (params.month !== undefined) query.set('month', String(params.month));
  if (params.year !== undefined) query.set('year', String(params.year));
  if (params.petId) query.set('petId', params.petId);
  const str = query.toString();
  return str ? `?${str}` : '';
}

export async function getCalendarEvents(
  params: GetCalendarEventsQuery = {},
): Promise<CalendarEvent[]> {
  const token = getToken() ?? undefined;
  return apiRequest<CalendarEvent[]>(`/calendar/events${buildQuery(params)}`, { token });
}

export async function createCalendarEvent(
  input: CreateCalendarEventInput,
): Promise<CalendarEvent> {
  const token = getToken() ?? undefined;
  return apiRequest<CalendarEvent>('/calendar/events', {
    method: 'POST',
    body: input,
    token,
  });
}

export async function updateCalendarEvent(
  id: string,
  input: UpdateCalendarEventInput,
): Promise<CalendarEvent> {
  const token = getToken() ?? undefined;
  return apiRequest<CalendarEvent>(`/calendar/events/${id}`, {
    method: 'PUT',
    body: input,
    token,
  });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const token = getToken() ?? undefined;
  await apiRequest<void>(`/calendar/events/${id}`, {
    method: 'DELETE',
    token,
  });
}
