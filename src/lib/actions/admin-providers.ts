'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/admin/log-action';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

export interface AdminActionResult {
  success: boolean;
  message?: string;
}

export async function updateProviderVerificationAction(
  providerId: string,
  status: 'verified' | 'rejected' | 'pending' | 'unverified'
): Promise<AdminActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('providers')
    .update({ verification_status: status })
    .eq('id', providerId);

  if (error) return { success: false, message: error.message };

  const { data: provider } = await supabase
    .from('providers')
    .select('user_id, business_name')
    .eq('id', providerId)
    .single();

  if (provider) {
    await supabase.from('notifications').insert({
      user_id: provider.user_id,
      type: 'system',
      title: status === 'verified' ? 'You\'re verified!' : 'Verification update',
      body:
        status === 'verified'
          ? 'Your business is now verified and visible in search.'
          : `Your verification status was updated to ${status}.`,
      link: '/pro/dashboard/settings/verification',
    });

    const { data: providerUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', provider.user_id)
      .single();

    await emitAutomationEvent('provider.verification_updated', {
      providerId,
      status,
      businessName: provider.business_name,
      providerEmail: providerUser?.email ?? '',
    });
  }

  await logAdminAction('update_provider_verification', 'providers', providerId, { status });
  revalidatePath('/admin/providers');
  return { success: true };
}

export async function toggleProviderFeaturedAction(
  providerId: string,
  featured: boolean
): Promise<AdminActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from('providers').update({ is_featured: featured }).eq('id', providerId);

  if (error) return { success: false, message: error.message };

  await logAdminAction(featured ? 'feature_provider' : 'unfeature_provider', 'providers', providerId);
  revalidatePath('/admin/providers');
  return { success: true };
}

export async function updateVerificationDocumentStatusAction(
  verificationId: string,
  status: 'verified' | 'rejected'
): Promise<AdminActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('verifications')
    .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
    .eq('id', verificationId);

  if (error) return { success: false, message: error.message };

  await logAdminAction('review_verification_document', 'verifications', verificationId, { status });
  revalidatePath('/admin/providers');
  return { success: true };
}
