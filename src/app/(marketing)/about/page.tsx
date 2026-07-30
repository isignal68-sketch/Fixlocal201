import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'About FixLocal',
  description: 'Learn about FixLocal\'s mission to connect homeowners with trusted local service pros.',
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">About FixLocal</h1>
      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
        <p className="text-lg text-muted-foreground">
          FixLocal started with a simple frustration: finding a reliable plumber, electrician, or
          cleaner shouldn&apos;t require a dozen phone calls and a leap of faith. We built a
          marketplace where every provider is verified, every price is upfront, and every review
          is from a real completed job.
        </p>
        <p className="mt-4 text-muted-foreground">
          Today, tens of thousands of service professionals use FixLocal to grow their business,
          and homeowners across the country use it to get things fixed, cleaned, and built —
          without the guesswork.
        </p>
        <h2 className="mt-10 font-display text-2xl font-semibold">Our commitment</h2>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>Every provider completes identity and, where applicable, license verification.</li>
          <li>Reviews are only left by customers with a completed, paid booking.</li>
          <li>Payments are held securely until the job is confirmed complete.</li>
          <li>Our support team is available for every booking, every time.</li>
        </ul>
      </div>
    </div>
  );
}
