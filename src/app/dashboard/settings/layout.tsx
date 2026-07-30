import { SettingsTabs } from '@/components/shared/settings-tabs';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <div className="mt-6">
        <SettingsTabs basePath="/dashboard" />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
