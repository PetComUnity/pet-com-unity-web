import { mockAvailablePets } from "@/app/mockAdoptionPet";
import { AdoptionPetCard } from "@/components/pet/AdoptionPetCard";

export function AvailablePetsList() {
  return (
    <section className="bg-[#fff8f0] px-5 py-14 sm:px-8 lg:px-16 lg:py-20">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10">
        <div className="max-w-[42rem] space-y-3 text-[#17243b]">
          <p className="font-display text-[3rem] text-semibold leading-none tracking-[-0.04em] text-[#1a202c]">
            Available Pets
          </p>
          <p className="max-w-[34rem] text-base leading-7 text-[#364153] sm:text-[1.1rem]">
            Sign in to start the adoption process
          </p>
        </div>

        <div className="grid justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockAvailablePets.map((pet) => (
            <AdoptionPetCard key={pet.name} pet={pet} />
          ))}
        </div>
      </div>
    </section>
  );
}
