"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { getMyPets } from "@/features/pets/pet-api.service";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AddPetModal } from "@/components/pet/AddPetModal";
import { MyPetCard } from "@/components/pet/MyPetCard";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

const petTabs = [
  { id: "my-pets", label: "My pets" },
  { id: "calendar", label: "My Calendar" },
  { id: "adoption-list", label: "Adoption list" },
] as const;

type PetTabId = (typeof petTabs)[number]["id"];

function tabClassName(isActive: boolean) {
  return cn(
    "relative shrink-0 pb-3 text-left font-display text-[1rem] leading-none tracking-[-0.035em] text-[#2d2925] transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d68532]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb]",
    "sm:text-[1.5rem] lg:text-[1.75rem]",
    isActive ? "text-[#1f1c19]" : "text-[#4d443d] hover:text-[#1f1c19]",
  );
}

export default function MyPetsPage() {
  const router = useRouter();
  const { appUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<PetTabId>("my-pets");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [petsError, setPetsError] = useState<string | null>(null);
  const [addPetModalOpen, setAddPetModalOpen] = useState(false);

  const loadPets = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingPets(true);
      setPetsError(null);
      const result = await getMyPets(signal);
      setPets(result);
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setPetsError(
        error instanceof Error
          ? error.message
          : "We could not load your pets right now.",
      );
    } finally {
      if (!signal?.aborted) {
        setLoadingPets(false);
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!appUser) {
      return undefined;
    }

    const abortController = new AbortController();

    void Promise.resolve().then(() => loadPets(abortController.signal));

    return () => {
      abortController.abort();
    };
  }, [appUser, authLoading, loadPets]);

  const hasPets = !loadingPets && !petsError && pets.length > 0;

  function handleTabClick(tabId: PetTabId) {
    if (tabId === "calendar") {
      router.push("/pets/calendar");
    } else if (tabId === "adoption-list") {
      router.push("/pets/adoption-list");
    } else {
      setActiveTab(tabId);
    }
  }

  return (
    <ProtectedRoute>
      <section className="min-h-[calc(100vh-72px)] bg-[#fcf5eb]">
        <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1240px] flex-col px-5 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10 lg:px-14 lg:pt-14 lg:pb-14">
          <div className="mt-2 mb-10 flex w-full justify-center lg:mt-10 lg:mb-30">
            <button
              type="button"
              className="font-display inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[16px] border border-[#1a202c] bg-[#97ff7b] px-8 py-4 text-center text-lg font-bold tracking-[0.22em] text-[#1a202c] shadow-[0_18px_45px_rgba(214,133,50,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#6bb556] hover:shadow-[0_22px_55px_rgba(214,133,50,0.28)] focus-visible:ring-2 focus-visible:ring-[#d68532]/45 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb] focus-visible:outline-none sm:min-h-16 sm:max-w-[300px] sm:text-base lg:min-h-[72px] lg:max-w-[340px] lg:text-[1.5rem]"
              onClick={() => setAddPetModalOpen(true)}
            >
              <Plus
                className="h-5 w-5 stroke-[2.5] text-[#1a202c]"
                aria-hidden="true"
              />
              Add pet
            </button>
          </div>

          <div className="overflow-x-auto pb-3">
            <div
              role="tablist"
              aria-label="Pet dashboard tabs"
              className="flex min-w-max items-end justify-center gap-8 sm:gap-10 lg:justify-start lg:gap-14"
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
                    onClick={() => handleTabClick(tab.id)}
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

          {activeTab === "my-pets" ? (
            <>
              {hasPets ? (
                <div className="absolute top-[30%] right-[5%] sm:top-[25%] lg:top-[30%] xl:top-[25%] xl:right-[10%]">
                  <Image
                    src="/images/yellow-cat.png"
                    alt=""
                    width={124}
                    height={182}
                    aria-hidden="true"
                    loading="eager"
                    className="pointer-events-none relative z-10 -mb-1 w-[43px] select-none sm:w-[90px] lg:w-[110px]"
                  />
                </div>
              ) : null}
              <section
                id="panel-my-pets"
                role="tabpanel"
                aria-labelledby="tab-my-pets"
                tabIndex={0}
                className={cn(
                  "bg-transaprent relative min-h-[390px] w-full overflow-hidden rounded-[18px] focus-visible:ring-2 focus-visible:ring-[#d68532]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fcf5eb] focus-visible:outline-none sm:bg-white sm:p-8 sm:shadow-[0_4px_4px_rgba(0,0,0,0.25)]",
                  hasPets ? "mt-0" : "sm:mt-7 lg:mt-8",
                )}
              >
                {loadingPets ? (
                  <div className="flex min-h-[326px] items-center justify-center">
                    <Spinner label="Loading your pets..." />
                  </div>
                ) : petsError ? (
                  <div className="flex min-h-[326px] items-center justify-center text-center text-sm font-medium text-[#b91c1c]">
                    {petsError}
                  </div>
                ) : pets.length === 0 ? (
                  <div className="flex min-h-[326px] flex-col items-center justify-end gap-4">
                    <Image
                      src="/images/yellow-cat.png"
                      alt=""
                      width={124}
                      height={182}
                      aria-hidden="true"
                      loading="eager"
                      className="pointer-events-none relative w-[130px] opacity-50 select-none sm:absolute sm:right-10 sm:bottom-6 sm:w-[190px] lg:right-16 lg:w-[230px]"
                    />
                    <p className="font-display relative z-10 text-[1.75rem] leading-none font-semibold text-[#c3c0bc] sm:text-[2rem]">
                      No saved pets yet
                    </p>
                  </div>
                ) : (
                  <div className="grid justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {pets.map((pet) => (
                      <MyPetCard key={pet.id} pet={pet} />
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <section
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              tabIndex={0}
              className="mt-5 min-h-[390px] focus-visible:outline-none sm:mt-6 lg:mt-7"
            />
          )}
        </div>
        {addPetModalOpen ? (
          <AddPetModal
            onClose={() => setAddPetModalOpen(false)}
            onCreated={() => {
              void loadPets();
            }}
          />
        ) : null}
      </section>
    </ProtectedRoute>
  );
}
