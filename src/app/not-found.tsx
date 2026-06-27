import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <section className="min-h-[calc(100svh-4.5rem)] bg-[#fcf5eb]">
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,430px)] lg:px-14 lg:py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="font-display text-[clamp(3.75rem,12vw,8.5rem)] leading-[0.86] font-semibold text-[#17243b]">
            Page not found
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#52627b] sm:text-lg">
            The page may have moved, or the link could be pointing to an old
            path. Let&apos;s get you back to Pet.com.Unity.
          </p>
          <Link
            href={ROUTES.home}
            className={buttonVariants({
              size: "lg",
              className: "mt-8 rounded-[16px] px-7 bg-[#8df86e] border border-[#1a202c] transition hover:-translate-y-0.5 hover:bg-[#7eea60] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none",
            })}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            Back home
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[430px]">
          <Image
            src="/images/not_found.png"
            alt="Page not found pet illustration"
            width={362}
            height={241}
            priority
            sizes="(min-width: 1024px) 430px, min(90vw, 430px)"
            className="h-auto w-full rounded-[18px] border border-[#1a202c]/15 shadow-[0_24px_65px_rgba(214,133,50,0.22)]"
          />
        </div>
      </div>
    </section>
  );
}
