"use client";

import { AvailablePetsList } from "@/components/pet/AvailablePetsList";
import { PetDashboardTabs } from "@/components/pet/PetDashboardTabs";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function AdoptionListPage() {
  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <section className="min-h-[calc(100vh-72px)] bg-[#fff8f0]">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col px-5 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10 lg:px-14 lg:pt-14 lg:pb-14">
          <PetDashboardTabs className="mb-6" />

          <div
            id="panel-adoption-list"
            role="tabpanel"
            aria-labelledby="tab-adoption-list"
            tabIndex={0}
            className="focus-visible:ring-2 focus-visible:ring-[#d68532]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fff8f0] focus-visible:outline-none"
          >
            <AvailablePetsList
              className="bg-transparent px-0 py-0"
              contentClassName="max-w-none gap-8"
            />
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
