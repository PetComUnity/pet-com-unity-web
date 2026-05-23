import Image from "next/image";

const socialIcons = [
  { src: "/icons/facebook.svg", alt: "Facebook" },
  { src: "/icons/instagram.svg", alt: "Instagram" },
  { src: "/icons/youtube.svg", alt: "YouTube" },
];

export function SocialLinks() {
  return (
    <div className="flex items-center justify-center gap-4">
      {socialIcons.map((icon) => (
        <div
          key={icon.src}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-sm"
        >
          <Image
            src={icon.src}
            alt={icon.alt}
            width={28}
            height={28}
            className="h-7 w-auto"
          />
        </div>
      ))}
    </div>
  );
}
