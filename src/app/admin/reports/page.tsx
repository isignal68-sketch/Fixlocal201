import type { Metadata } from 'next';
import { Flag } from 'lucide-react';
import { getOpenReports } from '@/lib/data/admin';
import { ReportActions } from '@/components/shared/report-actions';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Reports' };

export default async function AdminReportsPage() {
  const reports = await getOpenReports();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Reports</h1>
      <p className="mt-1 text-muted-foreground">User-submitted reports about providers and reviews.</p>

      <div className="mt-6 space-y-4">
        {reports.length === 0 ? (
          <EmptyState icon={Flag} title="No reports" description="You're all caught up." />
        ) : (
          reports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{report.reason}</p>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reported by {report.reporter_name ?? 'a user'}
                    {report.reported_provider_name && ` about ${report.reported_provider_name}`}
                  </p>
                  {report.details && <p className="mt-2 text-sm">{report.details}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{formatDate(report.created_at)}</p>
                </div>
                {report.status === 'open' && <ReportActions reportId={report.id} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
