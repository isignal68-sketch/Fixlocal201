import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/shared/contact-form';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Get in touch with the FixLocal support team.',
  alternates: { canonical: `${siteConfig.url}/contact` },
};

const contactMethods = [
  { icon: Mail, label: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
  { icon: Phone, label: '1 (800) 555-0199', href: 'tel:+18005550199' },
  { icon: MapPin, label: 'San Francisco, CA', href: undefined },
];

export default function ContactPage() {
  return (
    <div className="container py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="font-display text-4xl font-bold">Get in touch</h1>
          <p className="mt-4 text-muted-foreground">
            Questions about a booking, your account, or becoming a provider? We&apos;re here to
            help.
          </p>

          <div className="mt-8 space-y-4">
            {contactMethods.map((method) => (
              <div key={method.label} className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                  <method.icon className="size-5" />
                </div>
                {method.href ? (
                  <a href={method.href} className="text-sm font-medium hover:text-primary">
                    {method.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium">{method.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
