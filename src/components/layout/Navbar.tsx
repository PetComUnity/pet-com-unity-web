"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Menu, MessageCircle, Play, X } from "lucide-react";
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

const dashboardLinks = [
  { href: ROUTES.dashboard, label: "Dashboard" },
  { href: ROUTES.pets, label: "My Pets" },
];

const socialIcons = [MessageCircle, Camera, Play];

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
    "font-serif text-[2.05rem] leading-none tracking-[-0.03em] text-white transition hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    isActive ? "underline decoration-1 underline-offset-4" : "no-underline",
  );
}

function mobileMenuSecondaryLinkClassName(isActive: boolean) {
  return cn(
    "text-sm font-medium uppercase tracking-[0.18em] text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    isActive ? "text-white" : "",
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, loading, logout, user } = useAuth();
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
    <header className="sticky top-0 z-40 border-b border-[#ddd0c0] bg-[#f1e9df]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-2 sm:px-6 md:gap-8 md:py-1.5 lg:px-8">
        <Link
          href={ROUTES.home}
          className="shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d2a3e]/30"
          aria-label="AnimalID home"
          onClick={closeMenu}
        >
          <Image
            src="/images/logo.png"
            alt="AnimalID"
            width={53}
            height={51}
            priority
            className="h-[50px] w-auto"
          />
        </Link>

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
            {user ? (
              <>
                <Link href={ROUTES.dashboard} className={authTextClassName()}>
                  Dashboard
                </Link>
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
          className="ml-auto flex h-12 w-12 items-center justify-center rounded-2xl text-[#1d2a3e] transition hover:bg-[#e7dccf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d2a3e]/30 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu className="h-8 w-8 stroke-[2.25]" />
          
        </button>
      </div>

      {menuOpen ? (
        <div
          id="site-navigation"
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* <Image
            src="/images/bg.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,156,44,0.14),rgba(230,123,17,0.12))]"
            aria-hidden="true"
          /> */}

          <div className="relative flex min-h-screen flex-col px-5 pb-8 pt-5 sm:px-6 bg-hero">
            <div className="flex items-start justify-between gap-4">
              {user ? (
                <button
                  type="button"
                  className="text-left text-[1.15rem] font-medium text-[#332012] transition hover:text-[#1d120a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Log out
                </button>
              ) : (
                <Link
                  href={ROUTES.login}
                  className="text-[1.15rem] font-medium text-[#332012] transition hover:text-[#1d120a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  onClick={closeMenu}
                >
                  Sign in
                </Link>
              )}

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                <X className="h-8 w-8 stroke-[2.5]" />
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col items-center justify-center gap-6 pb-14 pt-10 text-center"
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

              {user ? (
                <div className="mt-3 flex flex-col items-center gap-3">
                  {dashboardLinks.map((link) => (
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
              {socialIcons.map((Icon, index) => (
                <div
                  key={index}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white/95 shadow-[0_12px_30px_rgba(67,34,8,0.18)] backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
