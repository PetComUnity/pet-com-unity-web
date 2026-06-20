"use client";

import { type ReactNode, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button"; // 👈 For uniform button tokens
import { Spinner } from "@/components/ui/Spinner";       // 👈 For loading state indicators
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type ProfileFormLayoutProps = {
  title: string;
  description: string;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  avatarSection: ReactNode;
  children: ReactNode;
};

export function ProfileFormLayout({
  title,
  description,
  isSubmitting,
  onSubmit,
  avatarSection,
  children,
}: ProfileFormLayoutProps) {
  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[112px_1fr] lg:gap-12">
          {/* Left Side Panel Avatar */}
          <div className="flex justify-center lg:justify-start">
            {avatarSection}
          </div>

          {/* Right Side Input Matrix */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children}
            </div>

            {/* Master Submit Button Section */}
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={isSubmitting}
                // Mix default or primary button variant tokens with custom layout rules safely via cn()
                className={cn(
                  buttonVariants({ variant: "primary" }), 
                  "h-11 min-w-[140px] rounded-lg font-semibold gap-2 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4 animate-spin text-current" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}