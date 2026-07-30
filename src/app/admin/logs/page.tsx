import type { Metadata } from 'next';
import { FileClock } from 'lucide-react';
import { getAdminLogs } from '@/lib/data/admin';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin logs' };

export default async function AdminLogsPage() {
  const logs = await getAdminLogs(150);

  const supabase = await createClient();
  const adminIds = Array.from(new Set(logs.map((l) => l.admin_id)));
  const { data: admins } = adminIds.length
    ? await supabase.from('users').select('id, full_name').in('id', adminIds)
    : { data: [] };

  const adminNameMap = new Map((admins ?? []).map((a) => [a.id, a.full_name]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Activity logs</h1>
      <p className="mt-1 text-muted-foreground">An audit trail of admin actions on the platform.</p>

      <div className="mt-6">
        {logs.length === 0 ? (
          <EmptyState icon={FileClock} title="No activity yet" description="Admin actions will be recorded here." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Admin</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-4 font-medium">
                      {adminNameMap.get(log.admin_id) ?? 'Admin'}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {log.action.replace(/_/g, ' ')}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {log.target_table ? `${log.target_table}${log.target_id ? ` · ${log.target_id.slice(0, 8)}` : ''}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(log.created_at, { hour: 'numeric', minute: '2-digit' })}</td>
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
