import Image from "next/image";
import { PawPrint } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

type PetAdoptedCardProps = {
  name: string;
  image?: string;
};

export function PetAdoptedCard({ name, image }: PetAdoptedCardProps) {
  const uploadedImage = image?.trim();
  const hasUploadedImage = Boolean(uploadedImage && uploadedImage !== "/");

  return (
    <Card className="w-full max-w-[312px] overflow-hidden rounded-2xl border border-[#010101] bg-white shadow-sm">
      <div className="relative m-4 h-56 overflow-hidden rounded-2xl bg-[#f0ebe4]">
        {hasUploadedImage && uploadedImage ? (
          <Image
            src={uploadedImage}
            alt={name}
            fill
            sizes="312px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint
              className="h-1/2 w-1/2 text-[#c9b99a]"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <CardContent className="px-4 pt-0 pb-4">
        <h3 className="font-display text-[24px] leading-6 font-bold text-[#010101]">
          {name}
        </h3>

        <Button
          fullWidth
          className="font-display mt-4 h-[61px] rounded-2xl border border-[#010101] bg-[#ef9322] text-[24px] leading-6 font-bold text-[#010101] hover:bg-[#e68612]"
        >
          Happy with my family
        </Button>
      </CardContent>
    </Card>
  );
}
