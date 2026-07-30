'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toggleUserSuspensionAction, changeUserRoleAction } from '@/lib/actions/admin-users';
import type { UserRow } from '@/types/database';

export function AdminUserActions({ user }: { user: UserRow }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleSuspendToggle() {
    setIsPending(true);
    const result = await toggleUserSuspensionAction(user.id, !user.is_suspended);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not update user.');
      return;
    }
    toast.success(user.is_suspended ? 'User unsuspended' : 'User suspended');
    router.refresh();
  }

  async function handleRoleChange(role: 'customer' | 'provider' | 'admin') {
    setIsPending(true);
    const result = await changeUserRoleAction(user.id, role);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not update role.');
      return;
    }
    toast.success('Role updated');
    router.refresh();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-lg p-1.5 hover:bg-secondary" disabled={isPending}>
          <MoreVertical className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 w-48 rounded-xl border border-border bg-popover p-1.5 shadow-elevated"
        >
          <DropdownMenu.Item
            onSelect={handleSuspendToggle}
            className="cursor-pointer rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-secondary"
          >
            {user.is_suspended ? 'Unsuspend user' : 'Suspend user'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {(['customer', 'provider', 'admin'] as const)
            .filter((r) => r !== user.role)
            .map((role) => (
              <DropdownMenu.Item
                key={role}
                onSelect={() => handleRoleChange(role)}
                className="cursor-pointer rounded-lg px-2.5 py-2 text-sm capitalize outline-none hover:bg-secondary"
              >
                Make {role}
              </DropdownMenu.Item>
            ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
