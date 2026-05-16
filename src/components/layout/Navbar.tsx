"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PawPrint, QrCode, ShieldCheck } from "lucide-react";
import { ROLE_LABELS, VERIFICATION_ALLOWED_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";

const publicLinks = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.lostPets, label: "Lost Pets" },
];

const authenticatedLinks = [
  {
    href: ROUTES.dashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: ROUTES.pets,
    label: "My Pets",
    icon: PawPrint,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, loading, logout, user } = useAuth();

  const showVerificationLink =
    appUser && VERIFICATION_ALLOWED_ROLES.includes(appUser.role);

  async function handleLogout() {
    await logout();
    router.replace(ROUTES.home);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <Link href={ROUTES.home} className="text-lg font-semibold text-foreground">
                AnimalID
              </Link>
              <p className="text-sm text-muted">Digital pet identity for the MVP stage</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({
                    variant: pathname === link.href ? "secondary" : "ghost",
                    size: "sm",
                  }),
                )}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                {authenticatedLinks.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={buttonVariants({
                      variant: pathname.startsWith(href) ? "secondary" : "ghost",
                      size: "sm",
                    })}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
                {showVerificationLink ? (
                  <Link
                    href={ROUTES.adminVerification}
                    className={buttonVariants({
                      variant:
                        pathname === ROUTES.adminVerification ? "secondary" : "ghost",
                      size: "sm",
                    })}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Verification
                  </Link>
                ) : null}
                {appUser ? (
                  <Badge variant="neutral">{ROLE_LABELS[appUser.role]}</Badge>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Log in
                </Link>
                <Link
                  href={ROUTES.register}
                  className={buttonVariants({ variant: "primary", size: "sm" })}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
