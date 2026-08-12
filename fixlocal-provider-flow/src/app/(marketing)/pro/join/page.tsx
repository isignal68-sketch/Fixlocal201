import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';

export const metadata: Metadata = {
  title: 'Join FixLocal as a provider',
  description: 'Sign up to list your service business on FixLocal and start getting booked.',
  alternates: { canonical: `${siteConfig.url}/pro/join` },
};

const checklist = [
  'Create your free account',
  'Add your business details and services',
  'Upload license & insurance for verification',
  'Set your availability and service area',
  'Start receiving bookings',
];

export default async function ProJoinPage() {
  const user = await getCurrentUser();
  let ctaHref = '/signup?role=provider';
  let ctaLabel = 'Create provider account';

  if (user) {
    const existingProvider = await getProviderForUser(user.id);
    if (existingProvider) {
      ctaHref = '/pro/dashboard';
      ctaLabel = 'Go to your provider dashboard';
    } else {
      ctaHref = '/pro/onboarding';
      ctaLabel = 'Set up your provider profile';
    }
  }

  return (
    <div className="container py-16">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            List your business on FixLocal
          </h1>
          <p className="mt-4 text-muted-foreground">
            Join in minutes and start reaching customers actively searching for your services.
            It&apos;s free to get started.
          </p>

          <ul className="mt-8 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="mt-8">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>

          {!user && (
            <p className="mt-3 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login?redirect=/pro/onboarding" className="text-primary hover:underline">
                Sign in
              </Link>{' '}
              and add your business from the dashboard.
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-gradient-brand p-8 text-white">
          <p className="font-display text-lg font-semibold">What providers say</p>
          <blockquote className="mt-4 text-sm text-white/90">
            &ldquo;FixLocal has become our top lead source. The booking calendar alone saves us
            hours every week.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm text-white/70">— Dana M., Dana&apos;s Cleaning Co.</p>
        </div>
      </div>
    </div>
  );
}
