import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    image: "/icons/instagram.svg",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    image: "/icons/facebook.svg",
  },
  {
    label: "LinkedIn",
    href: "https://youtube.com",
    image: "/icons/youtube.svg",
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#f7941d] px-4 py-8">
      <div className="absolute inset-0 bg-[url('/images/footer_desktop.png')] bg-cover bg-center opacity-40" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-5">
        <div className="flex items-center gap-4">
          {socialLinks.map(({ label, href, image }) => (
            <Link key={label} href={href} target="_blank" aria-label={label}>
              <Image
                src={image}
                alt={label}
                width={36}
                height={36}
                className="transition hover:scale-105"
              />
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-[#17243b]">
          © 2025 Pet.com.Unity. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
