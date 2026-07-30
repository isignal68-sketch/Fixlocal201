import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, CalendarCheck, MessageCircle, ShieldCheck, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'How FixLocal works',
  description: 'Learn how to find, book, and pay a trusted local service provider on FixLocal.',
  alternates: { canonical: `${siteConfig.url}/how-it-works` },
};

const steps = [
  {
    icon: Search,
    title: 'Tell us what you need',
    description:
      'Search by service and ZIP code. We match you with verified, background-checked pros in your area who do that exact job.',
  },
  {
    icon: MessageCircle,
    title: 'Compare and message pros',
    description:
      'Review ratings, past work, and pricing side by side. Message providers directly to ask questions before you commit.',
  },
  {
    icon: CalendarCheck,
    title: 'Book a time that works',
    description:
      'Pick an available slot on the provider\'s calendar. You\'ll get a confirmation and reminders as the appointment approaches.',
  },
  {
    icon: ShieldCheck,
    title: 'The job gets done right',
    description:
      'Every pro on FixLocal carries verified licensing and insurance information, so you know who is showing up.',
  },
  {
    icon: CreditCard,
    title: 'Pay securely, after the fact',
    description:
      'Your payment is protected and only released to the provider once the job is marked complete.',
  },
  {
    icon: Star,
    title: 'Leave a review',
    description:
      'Rate your experience to help other homeowners — and help great pros get discovered.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">How FixLocal works</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Finding a trustworthy pro shouldn&apos;t mean a dozen phone calls and crossed fingers.
          Here&apos;s how we make it simple.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
        {steps.map((step) => (
          <div key={step.title} className="flex gap-4 rounded-2xl border border-border p-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <step.icon className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Button asChild size="lg">
          <Link href="/search">Find a pro now</Link>
        </Button>
      </div>
    </div>
  );
}
