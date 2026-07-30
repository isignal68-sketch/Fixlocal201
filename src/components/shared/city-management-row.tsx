'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { toggleCityActiveAction, deleteCityAction } from '@/lib/actions/admin-content';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { CityRow } from '@/types/database';

export function CityManagementRow({ city }: { city: CityRow }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleToggle(checked: boolean) {
    setIsPending(true);
    await toggleCityActiveAction(city.id, checked);
    setIsPending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete ${city.name}, ${city.state_code}?`)) return;
    setIsPending(true);
    const result = await deleteCityAction(city.id);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not delete city.');
      return;
    }
    toast.success('City deleted');
    router.refresh();
  }

  return (
    <tr>
      <td className="px-5 py-4 font-medium">{city.name}</td>
      <td className="px-5 py-4 text-muted-foreground">{city.state_code}</td>
      <td className="px-5 py-4 text-muted-foreground">
        {city.population ? city.population.toLocaleString() : '—'}
      </td>
      <td className="px-5 py-4">
        <Switch checked={city.is_active} onCheckedChange={handleToggle} disabled={isPending} />
      </td>
      <td className="px-5 py-4 text-right">
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}
