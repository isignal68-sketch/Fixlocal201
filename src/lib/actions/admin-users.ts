'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/admin/log-action';

export interface AdminActionResult {
  success: boolean;
  message?: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be signed in.' };

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Admin access required.' };

  return { userId: user.id };
}

export async function toggleUserSuspensionAction(
  userId: string,
  suspend: boolean
): Promise<AdminActionResult> {
  const { error } = await requireAdmin();
  if (error) return { success: false, message: error };

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from('users')
    .update({ is_suspended: suspend })
    .eq('id', userId);

  if (updateError) return { success: false, message: updateError.message };

  await logAdminAction(suspend ? 'suspend_user' : 'unsuspend_user', 'users', userId);
  revalidatePath('/admin/users');
  return { success: true };
}

export async function changeUserRoleAction(
  userId: string,
  role: 'customer' | 'provider' | 'admin'
): Promise<AdminActionResult> {
  const { error } = await requireAdmin();
  if (error) return { success: false, message: error };

  const supabase = await createClient();
  const { error: updateError } = await supabase.from('users').update({ role }).eq('id', userId);

  if (updateError) return { success: false, message: updateError.message };

  await logAdminAction('change_user_role', 'users', userId, { role });
  revalidatePath('/admin/users');
  return { success: true };
}
