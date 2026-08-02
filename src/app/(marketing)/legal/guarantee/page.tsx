import type { Metadata } from 'next';
import { ShieldCheck, RotateCcw, BadgeCheck } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'The FixLocal Guarantee',
  alternates: { canonical: `${siteConfig.url}/legal/guarantee` },
};

const pillars = [
  {
    icon: BadgeCheck,
    title: 'Verified providers',
    body: 'Every provider on FixLocal completes identity verification, and license/insurance documents are reviewed where applicable to their trade.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected payments',
    body: 'Funds are held securely and only released to the provider after you confirm the job is complete, giving you leverage if something isn\'t right.',
  },
  {
    icon: RotateCcw,
    title: 'Dispute support',
    body: 'If a job isn\'t completed as agreed, our support team will help mediate between you and the provider, including refund review for eligible cases.',
  },
];

export default function GuaranteePage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">The FixLocal Guarantee</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We built protections into every booking so you can hire with confidence.
      </p>

      <div className="mt-10 space-y-6">
        {pillars.map((p) => (
          <div key={p.title} className="flex gap-4 rounded-2xl border border-border p-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-700">
              <p.icon className="size-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold">{p.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        The FixLocal Guarantee applies to bookings made and paid for through the platform. Work
        arranged or paid for outside FixLocal is not covered. See our{' '}
        <a href="/legal/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        for full details.
      </p>
    </div>
  );
}
