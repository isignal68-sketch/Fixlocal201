'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface PhotoActionResult {
  success: boolean;
  message?: string;
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

export async function addPhotoAction(url: string, caption?: string): Promise<PhotoActionResult> {
  const { providerId, error } = await requireProviderId();
  if (!providerId) return { success: false, message: error };

  const supabase = await createClient();
  const { count } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', providerId);

  const { error: insertError } = await supabase.from('photos').insert({
    provider_id: providerId,
    url,
    caption: caption || null,
    sort_order: count ?? 0,
  });

  if (insertError) return { success: false, message: insertError.message };

  revalidatePath('/pro/dashboard/photos');
  revalidatePath('/pro/dashboard/settings');
  return { success: true };
}

export async function deletePhotoAction(photoId: string): Promise<PhotoActionResult> {
  const { providerId, error } = await requireProviderId();
  if (!providerId) return { success: false, message: error };

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)
    .eq('provider_id', providerId);

  if (deleteError) return { success: false, message: deleteError.message };

  revalidatePath('/pro/dashboard/photos');
  return { success: true };
}
