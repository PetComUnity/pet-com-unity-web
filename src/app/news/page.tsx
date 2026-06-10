import { NewsList } from "@/components/news/NewsList";
import { getLostPets } from "@/features/pets/pet-api.service";

export default async function NewsPage() {
  const lostPets = await getLostPets();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="text-center">
        <h1 className="mb-4 font-serif text-5xl font-bold text-[#17243B]">
          News
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Stay informed about lost and found pets and help reunite them with
          their families.
        </p>
      </div>

      <NewsList pets={lostPets} />
    </main>
  );
}
