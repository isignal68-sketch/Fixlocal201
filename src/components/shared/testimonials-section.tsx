import { Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Booked an electrician the same afternoon our panel started tripping. Upfront quote, no surprises, done in two hours.",
    name: 'Priya S.',
    location: 'Austin, TX',
  },
  {
    quote:
      'We compared three kitchen remodelers side by side and picked one with real before/after photos. Couldn\'t be happier with the result.',
    name: 'Marcus T.',
    location: 'Denver, CO',
  },
  {
    quote:
      'The messaging feature made it so easy to explain exactly what I needed before the pro even showed up.',
    name: 'Elena R.',
    location: 'Miami, FL',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-secondary/40 py-20">
      <div className="container">
        <div className="mb-14 text-center">
          <h2 className="font-display text-3xl font-semibold">Loved by homeowners</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Real feedback from people who found their pro on FixLocal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-soft"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto text-sm">
                <span className="font-medium">{t.name}</span>
                <span className="text-muted-foreground"> · {t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
