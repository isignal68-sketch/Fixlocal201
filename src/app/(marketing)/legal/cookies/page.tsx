import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  alternates: { canonical: `${siteConfig.url}/legal/cookies` },
};

const cookieTypes = [
  {
    title: 'Essential cookies',
    body: 'Required for core functionality like staying signed in and processing bookings. These cannot be disabled.',
  },
  {
    title: 'Preference cookies',
    body: 'Remember choices like dark mode or your last search location, so the site feels tailored to you.',
  },
  {
    title: 'Analytics cookies',
    body: 'Help us understand how the platform is used so we can improve it — for example, which categories are searched most often.',
  },
];

export default function CookiesPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: January 1, 2026</p>

      <p className="mt-8 text-muted-foreground">
        FixLocal uses cookies and similar technologies to operate the platform, remember your
        preferences, and understand how the site is used. Here&apos;s a breakdown of what we use
        and why.
      </p>

      <div className="mt-8 space-y-6">
        {cookieTypes.map((c) => (
          <div key={c.title} className="rounded-2xl border border-border p-5">
            <h2 className="font-display font-semibold">{c.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        You can control cookies through your browser settings. Disabling essential cookies may
        prevent you from signing in or completing bookings. Questions? Reach us at{' '}
        {siteConfig.supportEmail}.
      </p>
    </div>
  );
}
