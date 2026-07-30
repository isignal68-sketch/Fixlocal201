import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Provider success stories',
  alternates: { canonical: `${siteConfig.url}/pro/success-stories` },
};

const stories = [
  {
    name: "Dana's Cleaning Co.",
    location: 'Chicago, IL',
    quote:
      'We tripled our bookings in six months. The calendar sync alone gave us back hours every week.',
    stat: '3x bookings in 6 months',
  },
  {
    name: 'Rivera Electric',
    location: 'Austin, TX',
    quote:
      'FixLocal customers come in ready to book — the leads are far more qualified than other platforms we tried.',
    stat: '92% lead-to-job conversion',
  },
  {
    name: 'GreenScape Landscaping',
    location: 'Denver, CO',
    quote:
      "Verified reviews built trust fast. We went from a two-person crew to a team of nine.",
    stat: 'Grew from 2 to 9 employees',
  },
];

export default function ProSuccessStoriesPage() {
  return (
    <div className="container max-w-5xl py-16">
      <h1 className="font-display text-4xl font-bold">Real businesses, real growth</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        See how service businesses across the country are growing with FixLocal.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stories.map((s) => (
          <div key={s.name} className="flex flex-col rounded-2xl border border-border p-6">
            <p className="font-display text-2xl font-bold text-primary">{s.stat}</p>
            <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">
              &ldquo;{s.quote}&rdquo;
            </blockquote>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
