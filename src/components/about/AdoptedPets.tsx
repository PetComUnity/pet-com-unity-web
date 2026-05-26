import { PetAdoptedCard } from "./PetAdoptedCard";

const pets = [
  {
    name: "Buddy",
    image: "/",
  },
  {
    name: "Name",
    image: "/",
  },
  {
    name: "Buddy",
    image: "/",
  },
];

export function AdoptedPets() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-20 py-8">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[#17243b]">Adopted Pets</h2>
        <p className="mt-1 text-xs text-slate-400">
          Sign in to start the adoption process
        </p>
      </div>

      <div className="flex items-center justify-between gap-8">
        <button className="text-2xl text-slate-300">‹</button>

        <div className="grid w-full grid-cols-1 justify-items-center gap-10 md:grid-cols-3">
          {pets.map((pet, index) => (
            <PetAdoptedCard key={`${pet.name}-${index}`} {...pet} />
          ))}
        </div>

        <button className="text-2xl text-slate-300">›</button>
      </div>
    </section>
  );
}
