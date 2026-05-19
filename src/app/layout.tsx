import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PetComUnity",
    template: "%s | PetComUnity",
  },
  description:
    "PetComUnity is a responsive MVP for digital pet identification, QR lookups, lost and found flows, and vet verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
