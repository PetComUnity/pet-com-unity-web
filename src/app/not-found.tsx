import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle>We could not find that page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted">
            The route may have moved, or the QR code could be pointing at an old path.
          </p>
          <Link
            href={ROUTES.home}
            className={buttonVariants({ variant: "primary" })}
          >
            Go back home
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
