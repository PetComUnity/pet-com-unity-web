import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
});

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
    <html
      lang="en"
      className={`${montserrat.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full">
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
