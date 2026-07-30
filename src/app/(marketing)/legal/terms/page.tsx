import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: `${siteConfig.url}/legal/terms` },
};

const sections = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating an account or using FixLocal, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.',
  },
  {
    title: '2. The FixLocal marketplace',
    body: 'FixLocal connects customers with independent service providers. Providers are independent contractors, not employees or agents of FixLocal. We do not perform the services listed on the platform.',
  },
  {
    title: '3. Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information when creating your account.',
  },
  {
    title: '4. Bookings and payments',
    body: 'When you book a service, you authorize FixLocal to charge your payment method for the agreed price plus applicable fees. Funds are held and released to the provider upon job completion, subject to our payment terms.',
  },
  {
    title: '5. Cancellations and refunds',
    body: 'Cancellation policies vary by provider and are displayed prior to booking. Refund eligibility is determined based on the timing of cancellation and the provider\'s stated policy.',
  },
  {
    title: '6. Provider verification',
    body: 'FixLocal reviews license and insurance documentation submitted by providers where applicable, but does not guarantee the accuracy of any third-party credential and is not liable for a provider\'s work.',
  },
  {
    title: '7. Prohibited conduct',
    body: 'You may not use the platform to circumvent fees, harass other users, post false reviews, or engage in any unlawful activity.',
  },
  {
    title: '8. Limitation of liability',
    body: 'FixLocal is provided "as is." To the maximum extent permitted by law, FixLocal is not liable for indirect, incidental, or consequential damages arising from your use of the platform.',
  },
  {
    title: '9. Changes to these terms',
    body: 'We may update these terms from time to time. Continued use of FixLocal after changes take effect constitutes acceptance of the revised terms.',
  },
  {
    title: '10. Contact',
    body: `Questions about these terms can be sent to ${siteConfig.supportEmail}.`,
  },
];

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: January 1, 2026</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-display text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
