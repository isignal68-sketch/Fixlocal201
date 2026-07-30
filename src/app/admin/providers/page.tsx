import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProviders } from '@/lib/data/admin';
import { AdminFilterTabs } from '@/components/shared/admin-filter-tabs';
import { AdminProviderActions } from '@/components/shared/admin-provider-actions';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Providers' };

interface AdminProvidersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminProvidersPage({ searchParams }: AdminProvidersPageProps) {
  const { status } = await searchParams;
  const providers = await getAllProviders(status);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Providers</h1>

      <div className="mt-6">
        <AdminFilterTabs
          paramName="status"
          options={[
            { label: 'All', value: null },
            { label: 'Pending', value: 'pending' },
            { label: 'Verified', value: 'verified' },
            { label: 'Rejected', value: 'rejected' },
          ]}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Business</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {providers.map((provider) => (
              <tr key={provider.id}>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/providers/${provider.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {provider.business_name}
                  </Link>
                  <a
                    href={`/providers/${provider.slug}`}
                    target="_blank"
                    className="ml-2 text-xs text-muted-foreground hover:underline"
                  >
                    (view live)
                  </a>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {provider.average_rating > 0 ? provider.average_rating.toFixed(1) : '—'} (
                  {provider.review_count})
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={provider.verification_status} />
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(provider.created_at)}</td>
                <td className="px-5 py-4 text-right">
                  <AdminProviderActions provider={provider} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {providers.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No providers found.</p>
        )}
      </div>
    </div>
  );
}
