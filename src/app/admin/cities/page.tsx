import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CityFormDialog } from '@/components/shared/city-form-dialog';
import { CityManagementRow } from '@/components/shared/city-management-row';
import type { CityRow } from '@/types/database';

export const metadata: Metadata = { title: 'Cities' };

export default async function AdminCitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('cities').select('*').order('name', { ascending: true });
  const cities = (data as CityRow[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Cities</h1>
        <CityFormDialog />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">City</th>
              <th className="px-5 py-3 font-medium">State</th>
              <th className="px-5 py-3 font-medium">Population</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cities.map((city) => (
              <CityManagementRow key={city.id} city={city} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
