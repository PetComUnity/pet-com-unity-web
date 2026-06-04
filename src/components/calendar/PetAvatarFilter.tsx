'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PrivateImage } from '@/components/common/PrivateImage';
import { Pet } from '@/types';
import { getPetColor } from '@/features/calendar/calendar.types';

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

      {visible.map((pet, index) => {
        const color = getPetColor(page * PAGE_SIZE + index);
        const isSelected = selectedPetId === pet.id;
        return (
          <div
            key={pet.id}
            className="rounded-full p-[3px] transition-transform hover:scale-110 cursor-pointer"
            style={{
              backgroundColor: color,
              opacity: selectedPetId && !isSelected ? 0.5 : 1,
            }}
            onClick={() => onSelect(isSelected ? null : pet.id)}
            title={pet.name}
          >
            <div className="relative w-[34px] h-[34px] rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: color }}>
              {pet.name[0]?.toUpperCase()}
              {pet.imageFileId ? (
                <PrivateImage
                  fileId={pet.imageFileId}
                  alt={pet.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  fallbackSrc=""
                />
              ) : pet.imageUrl ? (
                <Image src={pet.imageUrl} alt={pet.name} fill sizes="34px" className="object-cover" />
              ) : null}
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
