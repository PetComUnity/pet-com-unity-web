export default function AboutUsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-sm lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            About us
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Building safer reunions for pets and the people who care for them
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted">
            AnimalID is a focused web experience for digital pet identity, QR-based
            public lookup, and trusted verification workflows. We are shaping the
            product around one practical goal: making it easier to identify pets and
            help them get back home.
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(15,118,110,0.12),rgba(255,255,255,0.85))] p-6">
          <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              What we value
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
              <p>Clear identity records that are easy for owners to maintain.</p>
              <p>Public-safe QR pages that share only the information needed.</p>
              <p>Verification tools that can grow with clinics, shelters, and admins.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
