'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import { createCategoryAction, updateCategoryAction } from '@/lib/actions/admin-content';
import { categoryIconMap } from '@/lib/category-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import type { CategoryRow } from '@/types/database';

const iconNames = Object.keys(categoryIconMap);

const formSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().or(z.literal('')),
  icon: z.string().min(1),
  isActive: z.boolean(),
});

type FormInput = z.infer<typeof formSchema>;

export function CategoryFormDialog({ category }: { category?: CategoryRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!category;

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormInput>({
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      icon: category?.icon ?? 'Wrench',
      isActive: category?.is_active ?? true,
    },
  });

  async function onSubmit(values: FormInput) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateCategoryAction(category!.id, values)
      : await createCategoryAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not save category.');
      return;
    }

    toast.success(isEditing ? 'Category updated' : 'Category created');
    setOpen(false);
    if (!isEditing) reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? 'ghost' : 'default'} size={isEditing ? 'icon' : 'default'}>
          {isEditing ? <Pencil className="size-4" /> : <><Plus className="size-4" />Add category</>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit category' : 'Add category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input {...register('name', { required: true })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Input {...register('description')} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Icon</label>
            <Select value={watch('icon')} onValueChange={(v) => setValue('icon', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isEditing ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
