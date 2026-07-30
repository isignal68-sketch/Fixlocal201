'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { toggleCouponActiveAction, deleteCouponAction } from '@/lib/actions/admin-content';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { CouponRow } from '@/types/database';

export function CouponManagementRow({ coupon }: { coupon: CouponRow }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleToggle(checked: boolean) {
    setIsPending(true);
    await toggleCouponActiveAction(coupon.id, checked);
    setIsPending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    setIsPending(true);
    const result = await deleteCouponAction(coupon.id);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not delete coupon.');
      return;
    }
    toast.success('Coupon deleted');
    router.refresh();
  }

  return (
    <tr>
      <td className="px-5 py-4 font-mono text-sm font-medium">{coupon.code}</td>
      <td className="px-5 py-4 text-muted-foreground">
        {coupon.discount_type === 'percent'
          ? `${coupon.discount_value}% off`
          : `${formatCurrency(coupon.discount_value)} off`}
      </td>
      <td className="px-5 py-4 text-muted-foreground">
        {coupon.times_redeemed}
        {coupon.max_redemptions ? ` / ${coupon.max_redemptions}` : ''}
      </td>
      <td className="px-5 py-4 text-muted-foreground">
        {coupon.expires_at ? formatDate(coupon.expires_at) : 'No expiry'}
      </td>
      <td className="px-5 py-4">
        <Switch checked={coupon.is_active} onCheckedChange={handleToggle} disabled={isPending} />
      </td>
      <td className="px-5 py-4 text-right">
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}
