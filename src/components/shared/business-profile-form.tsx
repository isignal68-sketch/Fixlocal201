'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  updateBusinessProfileAction,
  updateProviderImageAction,
} from '@/lib/actions/business-profile';
import { ImageUploader } from '@/components/shared/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { ProviderRow } from '@/types/database';

const businessProfileFormSchema = z.object({
  businessName: z.string().trim().min(2, 'Enter your business name').max(150),
  tagline: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  websiteUrl: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  instagramUrl: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  facebookUrl: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  yearsInBusiness: z.coerce.number().int().min(0).max(150).optional(),
  serviceRadiusMiles: z.coerce.number().int().min(1).max(200),
  licenseNumber: z.string().trim().max(100).optional().or(z.literal('')),
  insuranceProvider: z.string().trim().max(150).optional().or(z.literal('')),
});

type BusinessProfileFormInput = z.infer<typeof businessProfileFormSchema>;

export function BusinessProfileForm({ provider }: { provider: ProviderRow }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<BusinessProfileFormInput>({
    resolver: zodResolver(businessProfileFormSchema),
    defaultValues: {
      businessName: provider.business_name,
      tagline: provider.tagline ?? '',
      description: provider.description ?? '',
      websiteUrl: provider.website_url ?? '',
      instagramUrl: provider.instagram_url ?? '',
      facebookUrl: provider.facebook_url ?? '',
      yearsInBusiness: provider.years_in_business ?? undefined,
      serviceRadiusMiles: provider.service_radius_miles,
      licenseNumber: provider.license_number ?? '',
      insuranceProvider: provider.insurance_provider ?? '',
    },
  });

  async function onSubmit(values: BusinessProfileFormInput) {
    setIsSubmitting(true);
    const result = await updateBusinessProfileAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not update profile.');
      return;
    }

    toast.success('Business profile updated');
  }

  async function handleImageUploaded(field: 'logo_url' | 'cover_image_url', url: string) {
    const result = await updateProviderImageAction(field, url);
    if (!result.success) {
      toast.error(result.message ?? 'Could not save image.');
      return;
    }
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Logo</p>
          {provider.logo_url && (
            <Image
              src={provider.logo_url}
              alt="Logo"
              width={80}
              height={80}
              className="mb-3 rounded-xl object-cover"
            />
          )}
          <ImageUploader
            bucket="provider-logos"
            pathPrefix={provider.id}
            label="Upload logo"
            onUploaded={(url) => handleImageUploaded('logo_url', url)}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Cover image</p>
          {provider.cover_image_url && (
            <Image
              src={provider.cover_image_url}
              alt="Cover"
              width={160}
              height={80}
              className="mb-3 rounded-xl object-cover"
            />
          )}
          <ImageUploader
            bucket="provider-covers"
            pathPrefix={provider.id}
            label="Upload cover"
            onUploaded={(url) => handleImageUploaded('cover_image_url', url)}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input placeholder="A short one-liner about your business" {...field} />
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
                <FormLabel>About</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="yearsInBusiness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years in business</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="insuranceProvider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance provider</FormLabel>
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
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facebookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
