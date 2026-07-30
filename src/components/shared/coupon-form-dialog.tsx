'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createCouponAction } from '@/lib/actions/admin-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CouponFormInput {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxRedemptions?: number;
  expiresAt?: string;
  isActive: boolean;
}

export function CouponFormDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm<CouponFormInput>({
    defaultValues: { code: '', discountType: 'percent', discountValue: 10, isActive: true },
  });

  async function onSubmit(values: CouponFormInput) {
    setIsSubmitting(true);
    const result = await createCouponAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not create coupon.');
      return;
    }

    toast.success('Coupon created');
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New coupon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create coupon</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Code</label>
            <Input placeholder="WELCOME10" {...register('code', { required: true })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Discount type</label>
              <Select
                value={watch('discountType')}
                onValueChange={(v) => setValue('discountType', v as 'percent' | 'fixed')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent off</SelectItem>
                  <SelectItem value="fixed">Fixed amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Value</label>
              <Input type="number" min={1} {...register('discountValue', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max redemptions</label>
              <Input type="number" min={1} {...register('maxRedemptions')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expires</label>
              <Input type="date" {...register('expiresAt')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create coupon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
