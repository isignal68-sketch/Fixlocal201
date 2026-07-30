import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CouponFormDialog } from '@/components/shared/coupon-form-dialog';
import { CouponManagementRow } from '@/components/shared/coupon-management-row';
import type { CouponRow } from '@/types/database';

export const metadata: Metadata = { title: 'Coupons' };

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  const coupons = (data as CouponRow[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Coupons</h1>
        <CouponFormDialog />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Redemptions</th>
              <th className="px-5 py-3 font-medium">Expires</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((coupon) => (
              <CouponManagementRow key={coupon.id} coupon={coupon} />
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No coupons yet.</p>
        )}
      </div>
    </div>
  );
}
