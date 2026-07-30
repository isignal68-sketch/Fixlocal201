'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

const createProviderSchema = z.object({
  businessName: z.string().trim().min(2, 'Enter your business name').max(150),
  categorySlug: z.string().trim().min(1, 'Choose a category'),
  serviceTitle: z.string().trim().min(2, 'Describe your primary service').max(150),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  city: z.string().trim().min(1, 'Enter your city').max(100),
  state: z.string().trim().length(2, 'Use a 2-letter state code'),
  zipCode: z.string().trim().min(5).max(10),
  serviceRadiusMiles: z.number().int().min(1).max(200),
});

export interface CreateProviderResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function createProviderProfileAction(
  input: z.infer<typeof createProviderSchema>
): Promise<CreateProviderResult> {
  const parsed = createProviderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', parsed.data.categorySlug)
    .single();

  if (!category) {
    return { success: false, message: 'Invalid category selected.' };
  }

  const baseSlug = slugify(parsed.data.businessName);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase.from('providers').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .insert({
      user_id: user.id,
      business_name: parsed.data.businessName,
      slug,
      description: parsed.data.description || null,
      service_radius_miles: parsed.data.serviceRadiusMiles,
      verification_status: 'pending',
    })
    .select('id')
    .single();

  if (providerError || !provider) {
    return { success: false, message: providerError?.message ?? 'Could not create provider.' };
  }

  await supabase.from('services').insert({
    provider_id: provider.id,
    category_id: category.id,
    title: parsed.data.serviceTitle,
    slug: slugify(parsed.data.serviceTitle),
    description: parsed.data.description || parsed.data.serviceTitle,
    price_type: 'quote',
  });

  await supabase
    .from('users')
    .update({
      role: 'provider',
      city: parsed.data.city,
      state: parsed.data.state,
      zip_code: parsed.data.zipCode,
    })
    .eq('id', user.id);

  await emitAutomationEvent('provider.registered', {
    providerId: provider.id,
    userId: user.id,
    businessName: parsed.data.businessName,
    email: user.email ?? '',
    city: parsed.data.city,
    state: parsed.data.state,
  });

  redirect('/pro/dashboard');
}
