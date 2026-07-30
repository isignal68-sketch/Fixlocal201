import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Careers at FixLocal',
  alternates: { canonical: `${siteConfig.url}/careers` },
};

const openRoles = [
  { title: 'Senior Backend Engineer', team: 'Engineering', location: 'Remote (US)' },
  { title: 'Product Designer', team: 'Design', location: 'San Francisco, CA' },
  { title: 'Provider Success Manager', team: 'Operations', location: 'Remote (US)' },
  { title: 'Growth Marketing Manager', team: 'Marketing', location: 'San Francisco, CA' },
];

export default function CareersPage() {
  return (
    <div className="container max-w-4xl py-16">
      <h1 className="font-display text-4xl font-bold">Careers</h1>
      <p className="mt-4 text-muted-foreground">
        We&apos;re building the easiest way for people to get things fixed, cleaned, and built.
        Join us.
      </p>

      <div className="mt-10 divide-y divide-border rounded-2xl border border-border">
        {openRoles.map((role) => (
          <div key={role.title} className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">{role.title}</p>
              <p className="text-sm text-muted-foreground">{role.team}</p>
            </div>
            <p className="text-sm text-muted-foreground">{role.location}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Don&apos;t see the right role? Reach out at {siteConfig.supportEmail}.
      </p>
    </div>
  );
}
