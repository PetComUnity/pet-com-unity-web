import type { Pet } from "@/types";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

type NewsCardProps = {
  pet: Pet;
};

export function NewsCard({ pet }: NewsCardProps) {
  return (
    <Card className="w-full max-w-[312px] overflow-hidden rounded-2xl border border-[#010101] bg-white shadow-sm">
      <div className="m-4 flex h-56 items-center justify-center rounded-2xl bg-[#fff8ef]">
        <span className="font-display text-[24px] font-bold text-[#1A202C]/45">
          {pet.name}
        </span>
      </div>

      <CardContent className="px-4 pt-0 pb-4">
        <h3 className="font-display text-[24px] leading-6 font-bold text-[#010101]">
          Lost Pet Announcement
        </h3>

        <p className="font-display mt-3 text-[18px] leading-[120%] text-[#1A202C]/70">
          {pet.species} • {pet.breed}
        </p>

        <Button
          fullWidth
          className="font-display mt-4 h-[61px] rounded-2xl border border-[#010101] bg-[#ef9322] text-[24px] leading-6 font-bold text-[#010101] hover:bg-[#e68612]"
        >
          Read More
        </Button>
      </CardContent>
    </Card>
  );
}
