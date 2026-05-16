import Link from "next/link";
import {
  QrCode,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const features = [
  {
    title: "Digital Pet Passport",
    description:
      "Create a structured pet profile with identity details, status, and a photo ready for future verification.",
    icon: WalletCards,
  },
  {
    title: "QR Identification",
    description:
      "Generate public-facing QR pages so the right person can scan and quickly identify a pet.",
    icon: QrCode,
  },
  {
    title: "Lost and Found",
    description:
      "Mark pets as lost, expose public-safe details, and keep the rescue workflow visible from the start.",
    icon: Search,
  },
  {
    title: "Vet Verification",
    description:
      "Support vet and admin verification flows from day one so trust can be layered onto the profile.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Diploma MVP Starter
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              AnimalID
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              A responsive web platform for digital pet identification, public QR
              lookups, lost and found status, and trusted verification workflows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.register}
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Create an account
            </Link>
            <Link
              href={ROUTES.lostPets}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View lost pets
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ description, icon: Icon, title }) => (
            <Card key={title} className="h-full border-white/80 bg-white/95">
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-t border-white/70 pt-10 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand">Owners</p>
          <p className="text-sm leading-6 text-muted">
            Create pet records, upload photos, generate QR profiles, and manage
            lost or found status.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand">Veterinarians</p>
          <p className="text-sm leading-6 text-muted">
            Review pets waiting for verification and confirm trusted identity data.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand">Public QR scans</p>
          <p className="text-sm leading-6 text-muted">
            Open a public-safe page that helps reunite lost pets without exposing
            private account screens.
          </p>
        </div>
      </section>
    </div>
  );
}
