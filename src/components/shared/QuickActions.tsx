"use client";

import Link from "next/link";
import { PawPrint, Plus, ShieldCheck } from "lucide-react";
import { VERIFICATION_ALLOWED_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import type { AppUser } from "@/types";
import type { ElementType } from "react";

type QuickAction =
  | {
      href: string;
      label: string;
      description: string;
      icon: ElementType;
      action?: never;
    }
  | {
      action: "add-pet";
      label: string;
      description: string;
      icon: ElementType;
      href?: never;
    };

type QuickActionsProps = {
  onAddPet: () => void;
  user: AppUser;
};

export function QuickActions({ onAddPet, user }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      href: ROUTES.pets,
      label: "My Pets",
      description: "Saved profiles and QR records",
      icon: PawPrint,
    },
    {
      action: "add-pet",
      label: "Add Pet",
      description: "Create another pet profile",
      icon: Plus,
    },
  ];

  if (VERIFICATION_ALLOWED_ROLES.includes(user.role)) {
    quickActions.push({
      href: ROUTES.adminVerification,
      label: "Verification",
      description: "Pet profiles waiting for review",
      icon: ShieldCheck,
    });
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quickActions.map((action) => {
        const Icon = action.icon;

        const content = (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#c8c8c8] bg-white text-[#1a202c]">
              <Icon className="h-5 w-5" />
            </span>

            <span className="min-w-0">
              <span className="block text-[1rem] font-semibold text-[#1a202c]">
                {action.label}
              </span>
              <span className="mt-1 block text-sm font-medium text-[#7a7878]">
                {action.description}
              </span>
            </span>
          </>
        );

        if (action.action === "add-pet") {
          return (
            <button
              key="add-pet"
              type="button"
              onClick={onAddPet}
              className="flex min-h-[96px] items-center gap-4 rounded-[18px] border border-[#1a202c] bg-white p-5 text-left shadow-[0_4px_4px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex min-h-[96px] items-center gap-4 rounded-[18px] border border-[#1a202c] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
          >
            {content}
          </Link>
        );
      })}
    </section>
  );
}