'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createProviderProfileAction } from '@/lib/actions/provider-onboarding';
import { serviceCategories } from '@/lib/site-config';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, 'Enter your business name').max(150),
  categorySlug: z.string().min(1, 'Choose a category'),
  serviceTitle: z.string().trim().min(2, 'Describe your primary service').max(150),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  city: z.string().trim().min(1, 'Enter your city').max(100),
  state: z
    .string()
    .trim()
    .length(2, 'Use a 2-letter state code')
    .transform((v) => v.toUpperCase()),
  zipCode: z.string().trim().min(5, 'Enter a valid ZIP').max(10),
  serviceRadiusMiles: z.coerce.number().int().min(1).max(200),
});

type OnboardingInput = z.infer<typeof onboardingSchema>;

export function ProviderOnboardingForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: '',
      categorySlug: '',
      serviceTitle: '',
      description: '',
      city: '',
      state: '',
      zipCode: '',
      serviceRadiusMiles: 25,
    },
  });

  async function onSubmit(values: OnboardingInput) {
    setIsSubmitting(true);
    const result = await createProviderProfileAction(values);
    setIsSubmitting(false);

    if (result && !result.success) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof OnboardingInput, { message });
        }
      } else {
        toast.error(result.message ?? 'Could not create your provider profile.');
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-5">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business name</FormLabel>
              <FormControl>
                <Input placeholder="Rivera Electric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categorySlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
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
          name="serviceTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your first service</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Panel upgrades & rewiring" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About your business</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Tell customers what makes your business great." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="CA" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="serviceRadiusMiles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service radius (miles)</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={200} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Create my provider profile
        </Button>
      </form>
    </Form>
  );
}
