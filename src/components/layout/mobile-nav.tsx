'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { mainNav } from '@/lib/site-config';
import { Button } from '@/components/ui/button';
import type { UserRow } from '@/types/database';

export function MobileNav({ user }: { user: UserRow | null }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex size-9 items-center justify-center rounded-lg lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col gap-1 bg-background p-6 shadow-elevated">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-semibold">Menu</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close menu">
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              {item.title}
            </Link>
          ))}
          <div className="mt-4 border-t border-border pt-4">
            {user ? (
              <Link
                href={user.role === 'provider' ? '/pro/dashboard' : '/dashboard'}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
