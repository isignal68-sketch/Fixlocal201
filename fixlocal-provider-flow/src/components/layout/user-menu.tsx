'use client';

import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LayoutDashboard, LogOut, Settings, User as UserIcon, Briefcase } from 'lucide-react';
import { signOutAction } from '@/lib/actions/auth';
import { initials } from '@/lib/utils';
import type { UserRow } from '@/types/database';

export function UserMenu({ user }: { user: UserRow }) {
  const dashboardHref =
    user.role === 'admin' ? '/admin' : user.role === 'provider' ? '/pro/dashboard' : '/dashboard';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-semibold text-primary-700 transition-transform hover:scale-105"
          aria-label="Account menu"
        >
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.full_name} className="size-full object-cover" />
          ) : (
            initials(user.full_name || user.email)
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-elevated"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              href={dashboardHref}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-secondary"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </DropdownMenu.Item>
          {user.role === 'customer' && (
            <DropdownMenu.Item asChild>
              <Link
                href="/pro/join"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-secondary"
              >
                <Briefcase className="size-4" />
                Become a pro
              </Link>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item asChild>
            <Link
              href={`${dashboardHref}/settings`}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-secondary"
            >
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href={`${dashboardHref}/profile`}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-secondary"
            >
              <UserIcon className="size-4" />
              Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => signOutAction()}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-destructive outline-none hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
