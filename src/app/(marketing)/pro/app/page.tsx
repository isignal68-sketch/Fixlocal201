import type { Metadata } from 'next';
import { Smartphone, Bell, Calendar, MessageSquare } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'FixLocal Pro app',
  alternates: { canonical: `${siteConfig.url}/pro/app` },
};

const appFeatures = [
  { icon: Bell, title: 'Instant lead alerts', body: 'Get notified the moment a customer requests your service.' },
  { icon: Calendar, title: 'Manage your calendar on the go', body: 'Accept, reschedule, or decline bookings from anywhere.' },
  { icon: MessageSquare, title: 'Chat with customers', body: 'Reply to messages without waiting to get back to your desk.' },
];

export default function ProAppPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
          <Smartphone className="size-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold">Run your business from your phone</h1>
        <p className="mt-4 text-muted-foreground">
          The FixLocal Pro app puts your leads, calendar, and messages in your pocket.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
        {appFeatures.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border p-6 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-sm font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        The FixLocal Pro app is available on iOS and Android for verified providers. Sign in to
        your dashboard for the download link.
      </p>
    </div>
  );
}
