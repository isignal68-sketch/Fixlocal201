'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "We couldn't start that sign-in. Please try again.",
  auth_callback_error:
    'That sign-in link is invalid or has expired. Please try signing in again.',
  session_expired: 'Your session expired. Please sign in again.',
};

export function AuthErrorBanner() {
  const searchParams = useSearchParams();
  const code = searchParams.get('error');
  if (!code) return null;

  const message = ERROR_MESSAGES[code] ?? 'Something went wrong signing you in. Please try again.';

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
