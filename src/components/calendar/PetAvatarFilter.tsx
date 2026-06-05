'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PrivateImage } from '@/components/common/PrivateImage';
import { Pet } from '@/types';
import { getColorForPet } from '@/features/calendar/calendar.types';

interface PetAvatarFilterProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (petId: string | null) => void;
}

const PAGE_SIZE = 3;

export function PetAvatarFilter({ pets, selectedPetId, onSelect }: PetAvatarFilterProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(pets.length / PAGE_SIZE);
  const visible = pets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex items-center gap-2">
      {totalPages > 1 && (
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="text-[#f38c2c] disabled:opacity-30 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {visible.map((pet) => {
        const themeColor = getColorForPet(pet.themeColor);
        const isSelected = selectedPetId === pet.id;
        return (
          <div
            key={pet.id}
            className="group relative flex flex-col items-center"
          >
            <div
              className="rounded-full p-[3px] transition-transform hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: themeColor,
                opacity: selectedPetId && !isSelected ? 0.5 : 1,
              }}
              onClick={() => onSelect(isSelected ? null : pet.id)}
            >
              <div className="relative w-[34px] h-[34px] rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: themeColor }}>
                {pet.name[0]?.toUpperCase()}
                {pet.imageFileId ? (
                  <PrivateImage
                    fileId={pet.imageFileId}
                    alt={pet.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : pet.imageUrl ? (
                  <Image src={pet.imageUrl} alt={pet.name} fill sizes="34px" className="object-cover" />
                ) : null}
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-[#969696] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              {pet.name}
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="text-[#f38c2c] disabled:opacity-30 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
