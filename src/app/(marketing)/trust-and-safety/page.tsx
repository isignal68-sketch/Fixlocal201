import type { Metadata } from 'next';
import { ShieldCheck, UserCheck, Lock, Flag } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Trust & safety',
  alternates: { canonical: `${siteConfig.url}/trust-and-safety` },
};

const pillars = [
  { icon: UserCheck, title: 'Identity verification', body: 'Every provider verifies their identity before their profile goes live.' },
  { icon: ShieldCheck, title: 'License & insurance review', body: 'We collect and review license and insurance documentation for trades that require it.' },
  { icon: Lock, title: 'Secure payments', body: 'All payment data is processed by Stripe. FixLocal never stores full card numbers.' },
  { icon: Flag, title: 'Reporting tools', body: 'Report a provider, review, or message directly from the platform — our trust team reviews every report.' },
];

export default function TrustAndSafetyPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">Trust & safety</h1>
      <p className="mt-4 text-muted-foreground">
        Safety is built into every part of the FixLocal experience — from the first search to the
        final review.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {pillars.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <p.icon className="size-5" />
            </div>
            <h2 className="mt-4 font-display font-semibold">{p.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        If you ever feel unsafe or suspect fraudulent activity, contact our trust & safety team
        immediately at {siteConfig.supportEmail}.
      </p>
    </div>
  );
}
