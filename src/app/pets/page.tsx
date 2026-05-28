"use client";

import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import {
  ROLE_LABELS,
  VERIFICATION_ALLOWED_ROLES,
} from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const quickLinks = [
  {
    href: ROUTES.newPet,
    label: "Add Pet",
    description: "Create a new pet passport with a photo and QR ID.",
    icon: Plus,
  },
  {
    href: ROUTES.lostPets,
    label: "Lost Pets",
    description: "See the public rescue board from the owner perspective.",
    icon: ShieldCheck,
  },
] as const;

export default function MyPetsPage() {
  const { appUser } = useAuth();
  const showVerificationLink =
    !!appUser && VERIFICATION_ALLOWED_ROLES.includes(appUser.role);

  return (
    <ProtectedRoute>
      <AppShell
        title="My Pets"
        description="Manage your pet records, public QR pages, and next owner actions from one place."
      >
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                Welcome back{appUser?.name ? `, ${appUser.name}` : ""}.
              </CardTitle>
              <CardDescription>
                Use this space to create pet profiles, open QR pages, and keep
                rescue details within reach.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              {appUser ? (
                <Badge variant="neutral">{ROLE_LABELS[appUser.role]}</Badge>
              ) : null}
              <Link
                href={ROUTES.newPet}
                className={buttonVariants({ variant: "primary" })}
              >
                Add your first pet
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pet records</CardTitle>
              <CardDescription>
                Each profile can support QR lookup, verification, and lost-pet
                workflows without exposing private owner data publicly.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section
          className={`grid gap-4 ${
            showVerificationLink ? "md:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          {quickLinks.map(({ description, href, icon: Icon, label }) => (
            <Card key={href} className="h-full">
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{description}</CardDescription>
                <Link
                  href={href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Open
                </Link>
              </CardContent>
            </Card>
          ))}

          {showVerificationLink ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle>Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  Review submissions that need vet or admin verification.
                </CardDescription>
                <Link
                  href={ROUTES.adminVerification}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Open
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
