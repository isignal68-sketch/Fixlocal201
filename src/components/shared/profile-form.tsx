'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateProfileAction, updateAvatarAction } from '@/lib/actions/profile';
import { ImageUploader } from '@/components/shared/image-uploader';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { initials } from '@/lib/utils';
import type { UserRow } from '@/types/database';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.string().trim().max(50).optional().or(z.literal('')),
  zipCode: z.string().trim().max(10).optional().or(z.literal('')),
});

type ProfileFormInput = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user }: { user: UserRow }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user.full_name ?? '',
      phone: user.phone ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      zipCode: user.zip_code ?? '',
    },
  });

  async function handleAvatarUploaded(url: string) {
    const result = await updateAvatarAction(url);
    if (!result.success) {
      toast.error(result.message ?? 'Could not update photo.');
      return;
    }
    toast.success('Profile photo updated');
    router.refresh();
  }

  async function onSubmit(values: ProfileFormInput) {
    setIsSubmitting(true);
    const result = await updateProfileAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not update profile.');
      return;
    }

    toast.success('Profile updated');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.full_name} width={64} height={64} className="size-full object-cover" />
            ) : (
              initials(user.full_name || user.email)
            )}
          </div>
          <ImageUploader
            bucket="avatars"
            pathPrefix={user.id}
            label="Change photo"
            className="w-auto px-4 py-2 text-xs"
            onUploaded={handleAvatarUploaded}
          />
        </div>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Email</FormLabel>
          <Input value={user.email} disabled />
        </FormItem>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
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
        <Button type="submit" isLoading={isSubmitting}>
          Save changes
        </Button>
      </form>
    </Form>
  );
}
