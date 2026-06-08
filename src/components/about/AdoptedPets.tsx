import { PetAdoptedCard } from "./PetAdoptedCard";

const pets = [
  {
    name: "Buddy",
  },
  {
    name: "Name",
  },
  {
    name: "Buddy",
  },
];

export function AdoptedPets() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 lg:px-20">
      <div className="mb-8">
        <h2 className="font-display text-[32px] leading-[120%] font-bold text-[#1A202C] lg:text-[48px]">
          Adopted Pets
        </h2>

        <p className="font-display mt-1 text-[20px] leading-[120%] font-semibold tracking-[-0.02em] text-[#1A202C]/45 md:text-[24px]">
          Sign in to start the adoption process
        </p>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <button className="hidden text-2xl text-slate-300 lg:block">‹</button>

        <div className="grid w-full grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet, index) => (
            <PetAdoptedCard key={`${pet.name}-${index}`} {...pet} />
          ))}
        </div>

        <button className="hidden text-2xl text-slate-300 lg:block">›</button>
      </div>
    </section>
  );
}
