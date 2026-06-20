"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { VERIFICATION_ALLOWED_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const marketingLinks = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.aboutUs, label: "About us" },
  { href: ROUTES.news, label: "News" },
];

const appLinks = [
  { href: ROUTES.profile, label: "Profile" },
  { href: ROUTES.pets, label: "My Pets" },
  {href: ROUTES.clinic, label: "Clinic" }
];

const socialIcons = [
  { src: "/icons/facebook.svg", alt: "Facebook" },
  { src: "/icons/instagram.svg", alt: "Instagram" },
  { src: "/icons/youtube.svg", alt: "YouTube" },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === ROUTES.home) {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

function desktopNavLinkClassName(isActive: boolean) {
  return cn(
    "relative py-2 text-[15px] font-medium text-[#41372f] transition hover:text-[#17120f]",
    "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-[#41372f] after:transition-all",
    isActive ? "after:w-full" : "after:w-0 hover:after:w-full",
  );
}

function authTextClassName() {
  return "text-[15px] font-medium text-[#41372f] transition hover:text-[#17120f]";
}

function mobileMenuPrimaryLinkClassName(isActive: boolean) {
  return cn(
    "relative inline-block pb-1 font-serif text-[1.55rem] leading-none tracking-[-0.03em] !text-white transition hover:!text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-white after:transition-all after:content-['']",
    isActive ? "after:w-full" : "after:w-0",
  );
}

function mobileMenuSecondaryLinkClassName(isActive: boolean) {
  return cn(
    "relative inline-block text-sm font-medium uppercase tracking-[0.18em] !text-white transition hover:!text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-white after:transition-all after:content-['']",
    isActive ? "after:w-full" : "after:w-0",
  );
}

function mobileMenuTopLinkClassName(isActive: boolean) {
  return cn(
    "relative inline-block pb-1 text-[1.15rem] font-medium transition hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-white after:transition-all after:content-['']",
    isActive ? "after:w-full" : "after:w-0",
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const showVerificationLink =
    appUser && VERIFICATION_ALLOWED_ROLES.includes(appUser.role);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    await logout();
    closeMenu();
    router.replace(ROUTES.home);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#ddd0c0] bg-[#fff8f0]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-2 sm:px-6 md:gap-8 md:py-1.5 lg:px-8">
        <Link
          href={ROUTES.home}
          className="shrink-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#1d2a3e]/30 focus-visible:outline-none"
          aria-label="PetComUnity home"
          onClick={closeMenu}
        >
          <Image
            src="/images/logo.png"
            alt="PetComUnity logo"
            width={53}
            height={51}
            priority
            className="h-[50px] w-auto"
          />
        </Link>

        {appUser?.name ? (
          <div className="hidden min-w-0 flex-col justify-center md:flex">
            <span className="font-serif text-lg font-semibold tracking-[-0.03em] text-[#1d2a3e]">
              Pet.com.Unity
            </span>
            <span className="text-xs font-medium text-[#6b5b4d]">
              Welcome {appUser.name}
            </span>
          </div>
        ) : null}

        <div className="hidden min-w-0 flex-1 items-center justify-between md:flex">
          <nav
            className="flex min-w-0 items-center gap-5 lg:gap-8"
            aria-label="Primary navigation"
          >
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={desktopNavLinkClassName(
                  isActiveRoute(pathname, link.href),
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 lg:gap-6">
            {appUser ? (
              <>
                <Link href={ROUTES.profile} className={authTextClassName()}>
                  Profile
                </Link>
                {appUser.role === "vet" ? (
                <Link href={ROUTES.clinic} className={authTextClassName()}>
                  Clinic
                </Link>):(<Link href={ROUTES.pets} className={authTextClassName()}>
                  My Pets
                </Link>)}
                <button
                  type="button"
                  className={authTextClassName()}
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href={ROUTES.login} className={authTextClassName()}>
                Sign in
              </Link>
            )}
          </div>
        </div>

        <button
          type="button"
          className="ml-auto flex h-12 w-12 items-center justify-center rounded-2xl text-[#1d2a3e] transition hover:bg-[#e7dccf] focus-visible:ring-2 focus-visible:ring-[#1d2a3e]/30 focus-visible:outline-none md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu className="h-8 w-8 stroke-[2.25]" />
        </button>
      </div>

      {menuOpen ? (
        <div id="site-navigation" className="fixed inset-0 z-50 md:hidden">
          <div className="bg-hero relative flex min-h-screen flex-col px-5 pt-5 pb-8 sm:px-6">
            <div className="flex w-full items-center justify-between gap-4 text-white">
              {appUser ? (
                <button
                  type="button"
                  className="text-left text-[1.15rem] font-medium text-white transition hover:text-white/85 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Log out
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <Image
                    src="/images/logo.png"
                    alt="PetComUnity logo"
                    width={53}
                    height={51}
                    priority
                    className="h-[50px] w-auto"
                  />
                  <Link
                    href={ROUTES.login}
                    className={mobileMenuTopLinkClassName(
                      isActiveRoute(pathname, ROUTES.login),
                    )}
                    onClick={closeMenu}
                  >
                    Sign in
                  </Link>
                </div>
              )}

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                <X className="h-8 w-8 stroke-[2.5]" />
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col items-center justify-center gap-6 pt-10 pb-14 text-center text-white"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col items-center gap-5">
                {marketingLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={mobileMenuPrimaryLinkClassName(
                      isActiveRoute(pathname, link.href),
                    )}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {appUser ? (
                <div className="mt-3 flex flex-col items-center gap-3">
                  {appLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={mobileMenuSecondaryLinkClassName(
                        isActiveRoute(pathname, link.href),
                      )}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {showVerificationLink ? (
                    <Link
                      href={ROUTES.adminVerification}
                      className={mobileMenuSecondaryLinkClassName(
                        isActiveRoute(pathname, ROUTES.adminVerification),
                      )}
                      onClick={closeMenu}
                    >
                      Verification
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </nav>

            <div
              className="flex items-center justify-center gap-4"
              aria-hidden="true"
            >
              {socialIcons.map((icon) => (
                <div
                  key={icon.src}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white/95 shadow-[0_12px_30px_rgba(67,34,8,0.18)] backdrop-blur-sm"
                >
                  <Image
                    src={icon.src}
                    alt={icon.alt}
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
