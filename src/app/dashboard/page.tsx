"use client";

import Link from "next/link";
import { Plus, Search, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
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
    href: ROUTES.pets,
    label: "My Pets",
    description: "Review your profiles and open QR pages.",
    icon: Search,
  },
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
];

export default function DashboardPage() {
  const { appUser } = useAuth();

  return (
    <ProtectedRoute>
      <AppShell
        title="Dashboard"
        description="A clean starting point for owners, vets, and admins to move through the MVP."
      >
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                Welcome back{appUser?.name ? `, ${appUser.name}` : ""}.
              </CardTitle>
              <CardDescription>
                Use this space as the main handoff between registration, pet records,
                and public rescue workflows.
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
              <CardTitle>MVP notes</CardTitle>
              <CardDescription>
                The public QR page intentionally shows only safe fields, and public
                rescue contact can be added as a dedicated next step.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
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
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
