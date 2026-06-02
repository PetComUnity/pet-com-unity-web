'use client';

import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { CalendarEvent, getEventTypeColor } from '@/features/calendar/calendar.types';
import { Pet } from '@/types';

interface EventCardProps {
  event: CalendarEvent;
  pets: Pet[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (event: CalendarEvent) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function EventCard({ event, pets, onDelete, onEdit }: EventCardProps) {
  const color = getEventTypeColor(event.eventType);
  const pet = pets.find((p) => p.id === event.petId);

  return (
    <div className="relative flex items-center gap-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-3 pr-16 overflow-hidden">
      {pet?.imageUrl ? (
        <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0">
          <Image
            src={pet.imageUrl}
            alt={pet.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          {pet?.name[0]?.toUpperCase() ?? '?'}
        </div>
      )}

      <div className="flex flex-col min-w-0">
        <span className="font-display text-sm md:text-base font-medium text-[#1a202c] truncate">
          {event.title}
        </span>
        <span className="text-xs md:text-sm text-gray-500">{formatDate(event.date)}</span>
        {event.startTime && (
          <span className="text-xs md:text-sm text-gray-400">
            {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
          </span>
        )}
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <button
          onClick={() => onEdit(event)}
          className="text-gray-400 hover:text-[#f38c2c] transition-colors"
          aria-label="Edit event"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Delete event"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        className="absolute right-0 top-0 bottom-0 w-3.5 rounded-br-2xl rounded-tr-2xl"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
