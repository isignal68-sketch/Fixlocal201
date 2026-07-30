import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Calendar, CreditCard, MessageSquare, Star, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Grow your service business with FixLocal',
  description: 'Get more leads, manage bookings, and get paid faster with FixLocal for providers.',
  alternates: { canonical: `${siteConfig.url}/pro` },
};

const features = [
  { icon: TrendingUp, title: 'Qualified leads', body: 'Get matched with customers actively searching for your exact service in your area.' },
  { icon: Calendar, title: 'Booking calendar', body: 'Manage your availability and let customers book directly — no back-and-forth calls.' },
  { icon: CreditCard, title: 'Fast, secure payouts', body: 'Get paid through Stripe as soon as a job is marked complete.' },
  { icon: MessageSquare, title: 'Built-in messaging', body: 'Chat with customers before and after booking, all in one place.' },
  { icon: Star, title: 'Build your reputation', body: 'Every completed job earns a verified review that helps you win more work.' },
  { icon: BarChart3, title: 'Business analytics', body: 'Track revenue, repeat customers, and response time from your dashboard.' },
];

const tiers = [
  { name: 'Free', price: '$0', description: 'Get started and take your first bookings.', cta: 'Start free' },
  { name: 'Growth', price: '$49/mo', description: 'More leads, featured placement, and priority support.', cta: 'Start Growth', highlighted: true },
  { name: 'Pro', price: '$149/mo', description: 'Maximum visibility for established businesses.', cta: 'Start Pro' },
];

export default function ProLandingPage() {
  return (
    <div>
      <section className="bg-gradient-mesh">
        <div className="container flex flex-col items-center py-20 text-center">
          <h1 className="max-w-2xl font-display text-4xl font-bold sm:text-5xl">
            Grow your business with FixLocal
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Join thousands of local pros getting more leads, easier bookings, and faster payouts.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/pro/join">Join as a provider</Link>
          </Button>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-semibold">
            Plans for every business size
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  tier.highlighted
                    ? 'rounded-2xl border-2 border-primary bg-background p-8 shadow-elevated'
                    : 'rounded-2xl border border-border bg-background p-8'
                }
              >
                <p className="font-display text-lg font-semibold">{tier.name}</p>
                <p className="mt-2 font-display text-3xl font-bold">{tier.price}</p>
                <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  <Link href="/pro/join">{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
