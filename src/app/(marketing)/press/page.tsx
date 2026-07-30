import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Press',
  alternates: { canonical: `${siteConfig.url}/press` },
};

export default function PressPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">Press</h1>
      <p className="mt-4 text-muted-foreground">
        For media inquiries, interview requests, or brand assets, contact our press team.
      </p>

      <div className="mt-8 rounded-2xl border border-border p-6">
        <p className="font-medium">Media contact</p>
        <a href={`mailto:press@fixlocal.com`} className="mt-1 block text-sm text-primary hover:underline">
          press@fixlocal.com
        </a>
      </div>

      <h2 className="mt-12 font-display text-lg font-semibold">Brand assets</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Logos and brand guidelines are available on request from our press team.
      </p>
    </div>
  );
}
