import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { ServiceRow } from '@/types/database';

function formatPrice(service: ServiceRow) {
  if (service.price_type === 'quote') return 'Custom quote';
  if (service.price_min_cents && service.price_max_cents) {
    return `${formatCurrency(service.price_min_cents)}–${formatCurrency(service.price_max_cents)}`;
  }
  if (service.price_min_cents) return `From ${formatCurrency(service.price_min_cents)}`;
  return 'Contact for pricing';
}

export function ServiceList({
  services,
  providerSlug,
}: {
  services: ServiceRow[];
  providerSlug: string;
}) {
  if (services.length === 0) {
    return <p className="text-sm text-muted-foreground">No services listed yet.</p>;
  }

  return (
    <div className="divide-y divide-border rounded-2xl border border-border">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/book/${providerSlug}/${service.slug}`}
          className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-secondary/50"
        >
          <div>
            <p className="font-medium">{service.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {service.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-semibold">{formatPrice(service)}</span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
