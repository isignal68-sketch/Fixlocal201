'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { createServiceAction, updateServiceAction } from '@/lib/actions/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { ServiceRow, CategoryRow } from '@/types/database';

const serviceFormSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  categoryId: z.string().uuid('Choose a category'),
  description: z.string().trim().min(10, 'Add a short description').max(2000),
  priceType: z.enum(['fixed', 'hourly', 'quote']),
  priceMinCents: z.coerce.number().int().min(0).optional(),
  priceMaxCents: z.coerce.number().int().min(0).optional(),
  durationMinutes: z.coerce.number().int().min(0).optional(),
});

type ServiceFormInput = z.infer<typeof serviceFormSchema>;

export function ServiceFormDialog({
  categories,
  service,
  trigger,
}: {
  categories: CategoryRow[];
  service?: ServiceRow;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!service;

  const form = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service?.title ?? '',
      categoryId: service?.category_id ?? '',
      description: service?.description ?? '',
      priceType: service?.price_type ?? 'quote',
      priceMinCents: service?.price_min_cents ? service.price_min_cents / 100 : undefined,
      priceMaxCents: service?.price_max_cents ? service.price_max_cents / 100 : undefined,
      durationMinutes: service?.duration_minutes ?? undefined,
    },
  });

  const priceType = form.watch('priceType');

  async function onSubmit(values: ServiceFormInput) {
    setIsSubmitting(true);

    const payload = {
      ...values,
      priceMinCents: values.priceMinCents ? Math.round(values.priceMinCents * 100) : undefined,
      priceMaxCents: values.priceMaxCents ? Math.round(values.priceMaxCents * 100) : undefined,
    };

    const result = isEditing
      ? await updateServiceAction(service!.id, payload)
      : await createServiceAction(payload);

    setIsSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof ServiceFormInput, { message });
        }
      } else {
        toast.error(result.message ?? 'Could not save service.');
      }
      return;
    }

    toast.success(isEditing ? 'Service updated' : 'Service created');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            Add service
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit service' : 'Add a new service'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bathroom faucet installation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed price</SelectItem>
                      <SelectItem value="hourly">Hourly rate</SelectItem>
                      <SelectItem value="quote">Custom quote</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {priceType !== 'quote' && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="priceMinCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceMaxCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typical duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Save changes' : 'Create service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
