import type { Metadata } from 'next';
import { BookOpen, FileText, Video, Users } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Resources for providers',
  alternates: { canonical: `${siteConfig.url}/pro/resources` },
};

const resources = [
  { icon: BookOpen, title: 'Getting started guide', body: 'Set up your profile, add services, and configure availability in your first week.' },
  { icon: FileText, title: 'Pricing your services', body: 'Guidance on structuring fixed, hourly, and quote-based pricing that wins jobs.' },
  { icon: Video, title: 'Photo & profile tips', body: 'How top-performing providers present their work to build trust fast.' },
  { icon: Users, title: 'Community forum', body: 'Connect with other providers to share tips and get answers from the FixLocal team.' },
];

export default function ProResourcesPage() {
  return (
    <div className="container max-w-4xl py-16">
      <h1 className="font-display text-4xl font-bold">Resources for providers</h1>
      <p className="mt-4 text-muted-foreground">
        Everything you need to get the most out of your FixLocal profile.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {resources.map((r) => (
          <div key={r.title} className="rounded-2xl border border-border p-6">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <r.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-display font-semibold">{r.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
