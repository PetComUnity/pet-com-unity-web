"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import NavbarTabs, { TabType } from "@/components/vet/staff/NavbarTabs";
import { StaffTable } from "@/components/vet/staff";
import AddStaffSection from "@/components/vet/staff/AddStaffSection";


export default function ClinicPage() {
  const [activeTab, setActiveTab] =
    useState<TabType>("staff");


  return (
    <ProtectedRoute>
      <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb]">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-14">

          <NavbarTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "clients" && (
            <div>
              Clients Component
            </div>
          )}

          {activeTab === "appointments" && (
            <div>
              Appointments Component
            </div>
          )}

          {activeTab === "calendar" && (
            <div>
              Calendar Component
            </div>
          )}
{activeTab === "staff" && (
  <>
    <div className="mb-6 flex justify-end">
      {/* remove button OR keep for scroll */}
    </div>
    <AddStaffSection />
    <StaffTable />
  </>
)}

        </div>
      </section>
    </ProtectedRoute>
  );
}