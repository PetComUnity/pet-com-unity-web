import type { Pet } from "@/types";
import { NewsCard } from "./NewsCard";

type NewsListProps = {
  pets: Pet[];
};

export function NewsList({ pets }: NewsListProps) {
  if (pets.length === 0) {
    return (
      <p className="text-center text-lg text-slate-600">No lost pets found.</p>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => (
        <NewsCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
