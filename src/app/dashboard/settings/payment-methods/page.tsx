import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { createClient } from '@/lib/supabase/server';
import { PaymentMethodsList } from '@/components/shared/payment-methods-list';
import { AddPaymentMethodDialog } from '@/components/shared/add-payment-method-dialog';
import type { PaymentMethodRow } from '@/types/database';

export const metadata: Metadata = { title: 'Payment methods' };

export default async function PaymentMethodsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  const methods = (data as PaymentMethodRow[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">Payment methods</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the cards used to pay for bookings.
          </p>
        </div>
        <AddPaymentMethodDialog />
      </div>

      <div className="mt-6">
        <PaymentMethodsList methods={methods} />
      </div>
    </div>
  );
}
