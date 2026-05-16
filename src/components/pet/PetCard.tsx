import Link from "next/link";
import { PawPrint } from "lucide-react";
import type { Pet } from "@/types";
import { getPetDetailsRoute } from "@/constants/routes";
import { formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PetStatusBadge } from "@/components/pet/PetStatusBadge";

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{pet.name}</CardTitle>
            <CardDescription>
              {pet.species}
              {pet.breed ? ` - ${pet.breed}` : ""}
            </CardDescription>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <PawPrint className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PetStatusBadge
          isLost={pet.isLost}
          verificationStatus={pet.verificationStatus}
        />
        <dl className="grid gap-3 text-sm text-muted sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Microchip</dt>
            <dd>{pet.microchipId || "Not added"}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Updated</dt>
            <dd>{formatDate(pet.updatedAt ?? pet.createdAt)}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted">QR ready for public lookup</span>
        <Link
          href={getPetDetailsRoute(pet.id)}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
}
