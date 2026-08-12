import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { SignUpForm } from '@/components/shared/sign-up-form';
import { SocialAuthButtons } from '@/components/shared/social-auth-buttons';
import { AuthErrorBanner } from '@/components/shared/auth-error-banner';
import { Separator } from '@/components/ui/separator';

function SignUpFormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Create your account',
};

export default function SignUpPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-muted-foreground">Get started in under a minute.</p>

      <Suspense fallback={null}>
        <AuthErrorBanner />
      </Suspense>

      <div className="mt-8 space-y-6">
        <SocialAuthButtons />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <Suspense fallback={<SignUpFormSkeleton />}>
          <SignUpForm />
        </Suspense>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
