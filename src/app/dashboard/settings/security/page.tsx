import type { Metadata } from 'next';
import { ChangePasswordForm } from '@/components/shared/change-password-form';

export const metadata: Metadata = { title: 'Security settings' };

export default function SecuritySettingsPage() {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Change password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a strong password you don&apos;t use anywhere else.
      </p>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
