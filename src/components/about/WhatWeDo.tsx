const items = [
  "Help future owners find and adopt pets responsibly",
  "Provide private pet cabinets for storing medical records, vaccination history, microchip information, certificates, and important documents",
  "Allow veterinary clinics to verify and confirm medical records digitally",
  "Simplify communication between pet owners, shelters, and veterinarians",
  "Support safer and more transparent pet care management",
];

export function WhatWeDo() {
  return (
    <section className="mx-auto w-full max-w-[1300px] px-4 py-8 md:px-8 lg:px-20">
      <h2 className="font-display text-[24px] font-bold text-[#1A202C] md:text-[32px]">
        What We Do
      </h2>

      <ul className="font-display mt-3 list-disc pl-8 text-[24px] leading-[120%] text-[#1A202C] md:text-[32px]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
