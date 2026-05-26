import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

type PetAdoptedCardProps = {
  name: string;
  image: string;
};

export function PetAdoptedCard({ name, image }: PetAdoptedCardProps) {
  return (
    <Card className="w-[220px] overflow-hidden rounded-2xl border-none bg-white shadow-md">
      {/* Image */}
      <div className="relative h-[220px] w-full">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>

      {/* Content */}
      <CardContent className="flex flex-col items-center gap-3 p-4">
        <h3 className="text-lg font-semibold text-[#17243b]">{name}</h3>

        <Button
          size="sm"
          className="rounded-full bg-[#f7941d] px-4 text-sm text-[#17243b] hover:bg-[#e68612]"
        >
          Happy with my family
        </Button>
      </CardContent>
    </Card>
  );
}
