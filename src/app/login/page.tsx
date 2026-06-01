"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Spinner } from "@/components/ui/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const { loading, appUser } = useAuth();

  useEffect(() => {
    if (appUser) router.replace(ROUTES.pets);
  }, [router, appUser]);

  if (loading || appUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Preparing your session..." />
      </div>
    );
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#ef9322]">
      <Image
        src="/images/background.png"
        alt=""
        fill
        priority
        aria-hidden="true"
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-[320px] sm:max-w-[360px]">
          <div className="relative rounded-2xl bg-white shadow-xl">
            <div className="absolute -top-[70px] left-1/2 z-20 w-full -translate-x-1/2 min-[375px]:-top-[78px] md:-top-[88px]">
              <Image
                src="/images/animals.png"
                alt="Pets"
                width={360}
                height={137}
                priority
                className="block h-auto w-full object-contain"
              />
            </div>

            <div className="flex items-center px-6 pt-10 pb-6 min-[375px]:pt-12">
              <Link
                href={ROUTES.register}
                className="font-display flex-1 text-left text-base font-bold text-[#7A7878] opacity-50 transition hover:opacity-100 sm:text-xl"
              >
                Registration
              </Link>
              <span className="font-display flex-1 text-right text-base font-bold text-[#010101] sm:text-xl">
                SignIn
              </span>
            </div>

            <div className="px-6 pb-6">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full pb-8 sm:hidden">
        <SocialLinks />
      </div>
    </section>
  );
}
