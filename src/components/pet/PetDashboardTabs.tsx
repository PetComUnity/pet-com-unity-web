"use client";

import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const PET_DASHBOARD_TABS = [
  { id: "my-pets", label: "My pets", href: ROUTES.pets },
  { id: "calendar", label: "My Calendar", href: ROUTES.calendar },
  {
    id: "adoption-list",
    label: "Adoption list",
    href: ROUTES.adoptionList,
    allowedRoles: ["owner"] satisfies UserRole[],
  },
] as const;

type PetDashboardTab = (typeof PET_DASHBOARD_TABS)[number];
type RoleRestrictedPetDashboardTab = PetDashboardTab & {
  allowedRoles: readonly UserRole[];
};

function isRoleRestrictedTab(
  tab: PetDashboardTab,
): tab is RoleRestrictedPetDashboardTab {
  return "allowedRoles" in tab;
}

function tabClassName(isActive: boolean) {
  return cn(
    "relative shrink-0 pb-3 text-left font-display text-[1rem] leading-none tracking-[-0.035em] transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d68532]/40 focus-visible:ring-offset-4",
    "sm:text-[1.5rem] lg:text-[1.75rem]",
    isActive ? "text-[#1f1c19]" : "text-[#4d443d] hover:text-[#1f1c19]",
  );
}

export function PetDashboardTabs({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuth();

  const visibleTabs = PET_DASHBOARD_TABS.filter(
    (tab) =>
      !isRoleRestrictedTab(tab) ||
      (appUser ? tab.allowedRoles.includes(appUser.role) : false),
  );

  return (
    <div className={cn("overflow-x-auto pb-3", className)}>
      <div
        role="tablist"
        aria-label="Pet dashboard tabs"
        className="flex min-w-max items-end justify-center gap-8 sm:gap-10 lg:justify-start lg:gap-14"
      >
        {visibleTabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={tabClassName(isActive)}
              onClick={() => router.push(tab.href)}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute right-0 bottom-0 left-0 h-[2px] origin-left rounded-full bg-[#d68532] transition-transform duration-200",
                  isActive ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
