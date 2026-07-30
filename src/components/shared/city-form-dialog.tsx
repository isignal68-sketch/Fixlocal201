'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createCityAction } from '@/lib/actions/admin-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CityFormInput {
  name: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  population?: number;
  isActive: boolean;
}

export function CityFormDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm<CityFormInput>({
    defaultValues: { name: '', stateCode: '', latitude: 0, longitude: 0, isActive: true },
  });

  async function onSubmit(values: CityFormInput) {
    setIsSubmitting(true);
    const result = await createCityAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not save city.');
      return;
    }

    toast.success('City added');
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add city
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a city</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">City name</label>
              <Input {...register('name', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">State code</label>
              <Input maxLength={2} placeholder="CA" {...register('stateCode', { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Latitude</label>
              <Input type="number" step="any" {...register('latitude', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Longitude</label>
              <Input type="number" step="any" {...register('longitude', { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Population (optional)</label>
            <Input type="number" {...register('population')} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active</label>
            <Switch checked={watch('isActive')} onCheckedChange={(v) => setValue('isActive', v)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add city
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
