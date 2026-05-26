const items = [
  "Help future owners find and adopt pets responsibly",
  "Provide private pet cabinets for storing medical records, vaccination history, microchip information, certificates, and important documents",
  "Allow veterinary clinics to verify and confirm medical records digitally",
  "Simplify communication between pet owners, shelters, and veterinarians",
  "Support safer and more transparent pet care management",
];

export function WhatWeDo() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-20 pt-8">
      <h2 className="font-serif text-2xl text-[#17243b]">What We Do</h2>

      <ul className="mt-2 list-disc pl-8 text-xl leading-7 text-[#17243b]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
