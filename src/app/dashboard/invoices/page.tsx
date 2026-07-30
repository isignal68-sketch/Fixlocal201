import type { Metadata } from 'next';
import { Receipt, Download } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getCustomerInvoices } from '@/lib/data/customer-dashboard';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate, formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Invoices' };

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const invoices = await getCustomerInvoices(user.id);
  const supabase = await createClient();

  const invoicesWithLinks = await Promise.all(
    invoices.map(async (inv) => {
      if (!inv.pdf_url) return { ...inv, signedUrl: null };
      const { data } = await supabase.storage.from('invoices').createSignedUrl(inv.pdf_url, 60 * 10);
      return { ...inv, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Invoices</h1>

      <div className="mt-6">
        {invoicesWithLinks.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Invoices are generated automatically after each completed booking."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoicesWithLinks.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-5 py-4 font-medium">{inv.invoice_number}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {inv.booking.provider?.business_name}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="px-5 py-4 font-medium">{formatCurrency(inv.total_cents)}</td>
                    <td className="px-5 py-4 text-right">
                      {inv.signedUrl ? (
                        <a
                          href={inv.signedUrl}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
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
