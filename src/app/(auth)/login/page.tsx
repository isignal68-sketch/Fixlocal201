import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { SignInForm } from '@/components/shared/sign-in-form';
import { SocialAuthButtons } from '@/components/shared/social-auth-buttons';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-muted-foreground">Sign in to manage your bookings.</p>

      <div className="mt-8 space-y-6">
        <SocialAuthButtons />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
