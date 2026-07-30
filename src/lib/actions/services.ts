'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

const serviceSchema = z.object({
  title: z.string().trim().min(2, 'Enter a title').max(150),
  categoryId: z.string().uuid('Choose a category'),
  description: z.string().trim().min(10, 'Add a short description').max(2000),
  priceType: z.enum(['fixed', 'hourly', 'quote']),
  priceMinCents: z.coerce.number().int().min(0).optional(),
  priceMaxCents: z.coerce.number().int().min(0).optional(),
  durationMinutes: z.coerce.number().int().min(0).optional(),
});

export interface ServiceActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function requireProviderId(): Promise<{ providerId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be signed in.' };

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!provider) return { error: 'No provider profile found.' };

  return { providerId: provider.id };
}

export async function createServiceAction(
  input: z.infer<typeof serviceSchema>
): Promise<ServiceActionResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const { providerId, error } = await requireProviderId();
  if (!providerId) return { success: false, message: error };

  const supabase = await createClient();
  const { error: insertError } = await supabase.from('services').insert({
    provider_id: providerId,
    category_id: parsed.data.categoryId,
    title: parsed.data.title,
    slug: slugify(parsed.data.title),
    description: parsed.data.description,
    price_type: parsed.data.priceType,
    price_min_cents: parsed.data.priceMinCents || null,
    price_max_cents: parsed.data.priceMaxCents || null,
    duration_minutes: parsed.data.durationMinutes || null,
  });

  if (insertError) return { success: false, message: insertError.message };

  revalidatePath('/pro/dashboard/services');
  return { success: true };
}

export async function updateServiceAction(
  serviceId: string,
  input: z.infer<typeof serviceSchema>
): Promise<ServiceActionResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const { providerId, error } = await requireProviderId();
  if (!providerId) return { success: false, message: error };

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from('services')
    .update({
      category_id: parsed.data.categoryId,
      title: parsed.data.title,
      slug: slugify(parsed.data.title),
      description: parsed.data.description,
      price_type: parsed.data.priceType,
      price_min_cents: parsed.data.priceMinCents || null,
      price_max_cents: parsed.data.priceMaxCents || null,
      duration_minutes: parsed.data.durationMinutes || null,
    })
    .eq('id', serviceId)
    .eq('provider_id', providerId);

  if (updateError) return { success: false, message: updateError.message };

  revalidatePath('/pro/dashboard/services');
  return { success: true };
}

export async function toggleServiceActiveAction(
  serviceId: string,
  isActive: boolean
): Promise<ServiceActionResult> {
  const { providerId, error } = await requireProviderId();
  if (!providerId) return { success: false, message: error };

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', serviceId)
    .eq('provider_id', providerId);

  if (updateError) return { success: false, message: updateError.message };

  revalidatePath('/pro/dashboard/services');
  return { success: true };
}

export async function deleteServiceAction(serviceId: string): Promise<ServiceActionResult> {
  const { providerId, error } = await requireProviderId();
  if (!providerId) return { success: false, message: error };

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('provider_id', providerId);

  if (deleteError) return { success: false, message: deleteError.message };

  revalidatePath('/pro/dashboard/services');
  return { success: true };
}
