"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AddPetModal } from "@/components/pet/AddPetModal";


// Utilities & layout cards

import { VetProfile } from "@/components/auth/profile/VetProfile";
import { ShelterProfile } from "@/components/auth/profile/ShelterProfile";
import { OwnerProfile } from "@/components/auth/profile/OwnerProfile";
import { ChangePasswordCard } from "@/components/shared/ChangePasswordCard";
import { QuickActions } from "@/components/shared/QuickActions";

function ProfileContent() {
  const { appUser } = useAuth();
  const [addPetModalOpen, setAddPetModalOpen] = useState(false);

  if (!appUser) return null;

  const renderProfileForm = () => {
    switch (appUser.role) {
      case "vet":
        return <VetProfile />; // Internally calls useVetProfile() -> hits /api/clinics?userId=...
      case "shelter":
        return <ShelterProfile />; // Internally calls useShelterProfile() -> hits /api/shelters?userId=...
      case "owner":
      default:
        return <OwnerProfile />; // Keeps using useOwnerProfile() -> reads direct from auth document
    }
  };

  return (
    <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb]">
      <div className="mx-auto flex w-full max-w-[1368px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {renderProfileForm()}
        <ChangePasswordCard />
        <QuickActions user={appUser} onAddPet={() => setAddPetModalOpen(true)} />
      </div>
      {addPetModalOpen && <AddPetModal onClose={() => setAddPetModalOpen(false)} />}
    </section>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}