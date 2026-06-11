import Image from "next/image";
import Link from "next/link";
import type { Pet } from "@/types";
import { PawPrint } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getPetDetailsRoute } from "@/constants/routes";

type NewsCardProps = {
  pet: Pet;
};

export function NewsCard({ pet }: NewsCardProps) {
  return (
    <Card className="w-full max-w-[312px] overflow-hidden rounded-2xl border border-[#010101] bg-white shadow-sm">
      <div className="relative m-4 h-56 overflow-hidden rounded-2xl bg-[#fff8ef]">
        {pet.imageUrl ? (
          <Image
            src={pet.imageUrl}
            alt={pet.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-[#c9b99a]">
            <PawPrint className="h-28 w-28 text-[#c9b99a]" aria-hidden="true" />
          </div>
        )}
      </div>

      <CardContent className="px-4 pt-0 pb-4">
        <h3 className="font-display text-[24px] leading-6 font-bold text-[#010101]">
          {pet.name}
        </h3>

        <p className="font-display mt-3 text-[18px] leading-[120%] text-[#1A202C]/70">
          {pet.species} • {pet.breed}
        </p>

        <Link href={getPetDetailsRoute(pet.id)} className="block">
          <Button
            fullWidth
            className="font-display mt-4 h-[61px] rounded-2xl border border-[#010101] bg-[#ef9322] text-[24px] leading-6 font-bold text-[#010101] hover:bg-[#e68612]"
          >
            Read More
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
