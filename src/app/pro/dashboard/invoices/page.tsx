import type { Metadata } from 'next';
import { Receipt, Download } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { InvoiceRow, BookingRow } from '@/types/database';

export const metadata: Metadata = { title: 'Invoices' };

export default async function ProviderInvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('invoices')
    .select('*, booking:bookings!inner(id, provider_id, scheduled_at, customer:users!bookings_customer_id_fkey(full_name))')
    .eq('booking.provider_id', provider.id)
    .order('created_at', { ascending: false });

  const invoices = ((data ?? []) as unknown as Array<
    InvoiceRow & { booking: Pick<BookingRow, 'id' | 'scheduled_at'> & { customer: { full_name: string } | null } }
  >);

  const invoicesWithLinks = await Promise.all(
    invoices.map(async (inv) => {
      if (!inv.pdf_url) return { ...inv, signedUrl: null };
      const { data: signed } = await supabase.storage.from('invoices').createSignedUrl(inv.pdf_url, 60 * 10);
      return { ...inv, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Invoices</h1>
      <p className="mt-1 text-muted-foreground">Records of completed, invoiced jobs.</p>

      <div className="mt-6">
        {invoicesWithLinks.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices yet" description="Completed jobs will generate invoices here." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoicesWithLinks.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-5 py-4 font-medium">{inv.invoice_number}</td>
                    <td className="px-5 py-4 text-muted-foreground">{inv.booking.customer?.full_name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(inv.created_at)}</td>
                    <td className="px-5 py-4 font-medium">{formatCurrency(inv.total_cents)}</td>
                    <td className="px-5 py-4 text-right">
                      {inv.signedUrl ? (
                        <a href={inv.signedUrl} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Download className="size-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Processing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
