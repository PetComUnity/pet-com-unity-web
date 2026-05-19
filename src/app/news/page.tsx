const updates = [
  {
    title: "AnimalID MVP continues expanding its public QR flow",
    description:
      "We are refining the scan experience so finders can identify essential pet details quickly without exposing private account screens.",
  },
  {
    title: "Verification support is growing alongside owner tools",
    description:
      "The product direction keeps veterinarians and admins in view so trust can be layered into each pet profile over time.",
  },
  {
    title: "Lost and found visibility remains a core part of the roadmap",
    description:
      "Every design pass keeps reunification in mind, from structured pet profiles to clearer status communication across the app.",
  },
];

export default function NewsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          News
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Product notes and platform updates
        </h1>
        <p className="max-w-2xl text-base leading-8 text-muted">
          A simple stream of updates for the AnimalID project as the MVP evolves.
        </p>
      </section>

      <section className="grid gap-4">
        {updates.map((update) => (
          <article
            key={update.title}
            className="rounded-[1.75rem] border border-white/75 bg-white/85 p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-foreground">{update.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              {update.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
