import type { Metadata } from 'next';
import { getAllUsers } from '@/lib/data/admin';
import { AdminSearchInput } from '@/components/shared/admin-search-input';
import { AdminUserActions } from '@/components/shared/admin-user-actions';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, initials } from '@/lib/utils';

export const metadata: Metadata = { title: 'Users' };

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { q } = await searchParams;
  const users = await getAllUsers(q);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Users</h1>
        <AdminSearchInput placeholder="Search by name or email" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                      {initials(user.full_name || user.email)}
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 capitalize text-muted-foreground">{user.role}</td>
                <td className="px-5 py-4">
                  {user.is_suspended ? (
                    <StatusBadge status="suspended" />
                  ) : (
                    <StatusBadge status="active" />
                  )}
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(user.created_at)}</td>
                <td className="px-5 py-4 text-right">
                  <AdminUserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No users found.</p>
        )}
      </div>
    </div>
  );
}
