import { Search, CalendarCheck, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search and compare',
    description:
      'Tell us what you need and where. We surface vetted pros with real reviews and upfront pricing.',
  },
  {
    icon: CalendarCheck,
    title: 'Book in minutes',
    description:
      'Pick a time that works, message the pro with details, and confirm — no phone tag required.',
  },
  {
    icon: Sparkles,
    title: 'Get it done, guaranteed',
    description:
      'Pay securely through FixLocal after the job is complete, then leave a review to help your neighbors.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="container py-20">
      <div className="mb-14 text-center">
        <h2 className="font-display text-3xl font-semibold">How FixLocal works</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          From search to a finished job, in three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="relative flex flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
              <step.icon className="size-7" />
            </div>
            <span className="absolute -top-2 right-1/2 translate-x-8 font-display text-5xl font-bold text-secondary">
              {i + 1}
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
