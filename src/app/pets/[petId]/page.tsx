import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { getPetById } from "@/features/pets/pet-api.service";
import { getVerificationLabel } from "@/features/pets/pet.utils";
import { formatDate } from "@/lib/utils";

type PetDetailsPageProps = {
  params: Promise<{
    petId: string;
  }>;
};

export default async function PetDetailsPage({
  params,
}: PetDetailsPageProps) {
  const { petId } = await params;
  let pet = null;
  let errorMessage: string | null = null;

  try {
    pet = await getPetById(petId);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "We could not load this pet right now.";
  }

  if (errorMessage) {
    return (
      <section className="mx-auto flex w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="w-full">
          <CardContent className="pt-6">
            <p className="text-sm text-danger">{errorMessage}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!pet) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-3xl">{pet.name}</CardTitle>
            <CardDescription>
              {pet.species}
              {pet.breed ? ` • ${pet.breed}` : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={pet.isAdoptable ? "success" : "neutral"}>
              {pet.isAdoptable ? "Available for adoption" : "Not adoptable"}
            </Badge>
            <Badge variant={pet.verificationStatus === "verified" ? "success" : "warning"}>
              {getVerificationLabel(pet.verificationStatus)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>About this pet</CardTitle>
            <CardDescription>
              Review the adoption profile details pulled from the backend API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-4 text-sm text-muted sm:grid-cols-2">
              <div>
                <dt className="font-medium text-foreground">Color</dt>
                <dd>{pet.color || "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Birth date</dt>
                <dd>{pet.birthDate || "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Microchip ID</dt>
                <dd>{pet.microchipId || "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Registered</dt>
                <dd>{formatDate(pet.createdAt)}</dd>
              </div>
            </dl>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Description</p>
              <p className="text-sm leading-6 text-muted">
                {pet.description || "No description is available for this pet yet."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
            <CardDescription>
              Adoption profile image from the backend record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pet.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="h-80 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 text-sm text-muted">
                No image available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
