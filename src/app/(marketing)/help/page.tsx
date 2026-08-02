import type { Metadata } from 'next';
import { HelpFaqAccordion } from '@/components/shared/help-faq-accordion';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Help center',
  description: 'Answers to common questions about bookings, payments, and becoming a provider.',
  alternates: { canonical: `${siteConfig.url}/help` },
};

export default function HelpPage() {
  return (
    <div className="container max-w-2xl py-16">
      <h1 className="font-display text-4xl font-bold">Help center</h1>
      <p className="mt-4 text-muted-foreground">
        Answers to common questions. Can&apos;t find what you need?{' '}
        <a href="/contact" className="text-primary hover:underline">
          Contact us
        </a>
        .
      </p>

      <HelpFaqAccordion />
    </div>
  );
}
