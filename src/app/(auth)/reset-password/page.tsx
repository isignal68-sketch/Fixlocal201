import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/shared/reset-password-form';

export const metadata: Metadata = {
  title: 'Set a new password',
};

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      <p className="mt-1 text-muted-foreground">Choose a strong password for your account.</p>

      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
