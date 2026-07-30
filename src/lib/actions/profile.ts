'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.string().trim().max(50).optional().or(z.literal('')),
  zipCode: z.string().trim().max(10).optional().or(z.literal('')),
});

export interface ProfileActionResult {
  success: boolean;
  message?: string;
}

export async function updateProfileAction(
  input: z.infer<typeof profileSchema>
): Promise<ProfileActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Please check the form for errors.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { error } = await supabase
    .from('users')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      zip_code: parsed.data.zipCode || null,
    })
    .eq('id', user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function updateAvatarAction(avatarUrl: string): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { error } = await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', user.id);

  if (error) return { success: false, message: error.message };

  revalidatePath('/dashboard/settings');
  return { success: true };
}
