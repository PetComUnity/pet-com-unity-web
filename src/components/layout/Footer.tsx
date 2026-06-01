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
    label: "YouTube",
    href: "https://youtube.com",
    image: "/icons/youtube.svg",
  },
];

export function Footer() {
  return (
    <footer className="relative h-[140px] overflow-hidden bg-[#f7941d]">
      <div className="absolute inset-0 bg-[url('/images/footer_desktop.png')] bg-cover bg-center" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3">
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

        <p className="font-sans text-[12px] leading-[16px] font-normal text-white">
          © 2025 Pet.com.Unity. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
