'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'How do I book a service provider?',
    answer:
      'Search by service and ZIP code, compare providers, and click "Book now" on their profile. Pick an available time and confirm your details — the provider will accept or decline the request.',
  },
  {
    question: 'When am I charged for a booking?',
    answer:
      'Your payment method is authorized when you book, but funds are only captured and released to the provider after the job is marked complete.',
  },
  {
    question: 'What if I need to cancel or reschedule?',
    answer:
      'You can cancel or request a new time from your dashboard under Bookings. Cancellation terms vary by provider and are shown before you book.',
  },
  {
    question: 'How are providers verified?',
    answer:
      'Providers complete identity verification, and we review license and insurance documentation where applicable to their trade before they can appear as "Verified" on the platform.',
  },
  {
    question: "What if I'm not happy with the work?",
    answer:
      "Contact our support team within 48 hours of job completion. We'll help mediate with the provider and review refund eligibility per our Guarantee policy.",
  },
  {
    question: 'How do I become a provider?',
    answer:
      'Visit the "For businesses" page and select "Join as a provider." You\'ll create a business profile, add your services, and submit verification documents.',
  },
];

export function HelpFaqAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="mt-10 space-y-3">
      {faqs.map((faq, i) => (
        <Accordion.Item
          key={i}
          value={`item-${i}`}
          className="overflow-hidden rounded-2xl border border-border"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between px-5 py-4 text-left font-medium">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content
            className={cn(
              'overflow-hidden px-5 text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
            )}
          >
            <p className="pb-4">{faq.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
