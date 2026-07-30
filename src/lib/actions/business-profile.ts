'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const businessProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(150),
  tagline: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  websiteUrl: z.string().trim().url().optional().or(z.literal('')),
  instagramUrl: z.string().trim().url().optional().or(z.literal('')),
  facebookUrl: z.string().trim().url().optional().or(z.literal('')),
  yearsInBusiness: z.coerce.number().int().min(0).max(150).optional(),
  serviceRadiusMiles: z.coerce.number().int().min(1).max(200),
  licenseNumber: z.string().trim().max(100).optional().or(z.literal('')),
  insuranceProvider: z.string().trim().max(150).optional().or(z.literal('')),
});

export interface BusinessProfileActionResult {
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

export async function updateBusinessProfileAction(
  input: z.infer<typeof businessProfileSchema>
): Promise<BusinessProfileActionResult> {
  const parsed = businessProfileSchema.safeParse(input);
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
    .from('providers')
    .update({
      business_name: parsed.data.businessName,
      tagline: parsed.data.tagline || null,
      description: parsed.data.description || null,
      website_url: parsed.data.websiteUrl || null,
      instagram_url: parsed.data.instagramUrl || null,
      facebook_url: parsed.data.facebookUrl || null,
      years_in_business: parsed.data.yearsInBusiness ?? null,
      service_radius_miles: parsed.data.serviceRadiusMiles,
      license_number: parsed.data.licenseNumber || null,
      insurance_provider: parsed.data.insuranceProvider || null,
    })
    .eq('id', providerId);

  if (updateError) return { success: false, message: updateError.message };

  revalidatePath('/pro/dashboard/settings');
  return { success: true };
}

export async function updateProviderImageAction(
  field: 'logo_url' | 'cover_image_url',
  url: string
): Promise<BusinessProfileActionResult> {
  const { providerId, error } = await requireProviderId();
  if (!providerId) return { success: false, message: error };

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from('providers')
    .update({ [field]: url })
    .eq('id', providerId);

  if (updateError) return { success: false, message: updateError.message };

  revalidatePath('/pro/dashboard/settings');
  return { success: true };
}
