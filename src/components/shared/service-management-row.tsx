'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { toggleServiceActiveAction, deleteServiceAction } from '@/lib/actions/services';
import { formatCurrency } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ServiceFormDialog } from '@/components/shared/service-form-dialog';
import type { ServiceRow, CategoryRow } from '@/types/database';

function formatPrice(service: ServiceRow) {
  if (service.price_type === 'quote') return 'Custom quote';
  if (service.price_min_cents && service.price_max_cents) {
    return `${formatCurrency(service.price_min_cents)}–${formatCurrency(service.price_max_cents)}`;
  }
  if (service.price_min_cents) return `From ${formatCurrency(service.price_min_cents)}`;
  return '—';
}

export function ServiceManagementRow({
  service,
  categories,
}: {
  service: ServiceRow;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleToggle(checked: boolean) {
    setIsPending(true);
    await toggleServiceActiveAction(service.id, checked);
    setIsPending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    setIsPending(true);
    const result = await deleteServiceAction(service.id);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not delete service.');
      return;
    }
    toast.success('Service deleted');
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{service.title}</p>
        <p className="truncate text-sm text-muted-foreground">{formatPrice(service)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Switch checked={service.is_active} onCheckedChange={handleToggle} disabled={isPending} />
        <ServiceFormDialog
          categories={categories}
          service={service}
          trigger={
            <Button variant="ghost" size="icon">
              <Pencil className="size-4" />
            </Button>
          }
        />
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
