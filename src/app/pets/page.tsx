"use client";

import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { cn } from "@/lib/utils";

const petTabs = [
  { id: "my-pets", label: "My pets" },
  { id: "calendar", label: "My Calendar" },
  { id: "adoption-list", label: "Adoption list" },
] as const;

type PetTabId = (typeof petTabs)[number]["id"];

function tabClassName(isActive: boolean) {
  return cn(
    "relative shrink-0 pb-3 text-left font-display text-[1.9rem] leading-none tracking-[-0.035em] text-[#2d2925] transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d68532]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb]",
    "sm:text-[2.2rem] lg:text-[2.45rem]",
    isActive ? "text-[#1f1c19]" : "text-[#4d443d] hover:text-[#1f1c19]",
  );
}

export default function MyPetsPage() {
  const [activeTab, setActiveTab] = useState<PetTabId>("my-pets");

  return (
    <ProtectedRoute>
      <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb]">
        <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1240px] flex-col px-5 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:px-14 lg:pb-14 lg:pt-14">
          <div className="flex w-full justify-center mt-10 mb-30">
            <Link
              href={ROUTES.newPet}
              className="font-display inline-flex min-h-12 w-full items-center justify-center rounded-[16px] border border-[#1a202c] bg-[#97ff7b] px-8 py-4 text-center text-lg font-semibold tracking-[0.22em] text-white shadow-[0_18px_45px_rgba(214,133,50,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#6bb556] hover:shadow-[0_22px_55px_rgba(214,133,50,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d68532]/45 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb] sm:min-h-16 sm:max-w-[300px] sm:text-base lg:min-h-[72px] lg:max-w-[340px] lg:text-lg"
            >
              Add pet
            </Link>
          </div>

          <div className="overflow-x-auto pb-3">
            <div
              role="tablist"
              aria-label="Pet dashboard tabs"
              className="flex min-w-max items-end gap-8 sm:gap-10 lg:gap-14"
            >
              {petTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    className={tabClassName(isActive)}
                    onClick={() => setActiveTab(tab.id)}
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
        </div>
      </section>
    </ProtectedRoute>
  );
}
