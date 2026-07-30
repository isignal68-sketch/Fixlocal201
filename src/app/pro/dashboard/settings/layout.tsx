import { ProviderSettingsTabs } from '@/components/shared/provider-settings-tabs';

export default function ProviderSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Business settings</h1>
      <div className="mt-6">
        <ProviderSettingsTabs />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
