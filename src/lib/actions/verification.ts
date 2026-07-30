'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { emitAutomationEvent } from '@/lib/automation/emit-event';

export interface VerificationActionResult {
  success: boolean;
  message?: string;
}

export async function submitVerificationDocumentAction(
  documentType: string,
  documentUrl: string
): Promise<VerificationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in.' };

  const { data: provider } = await supabase
    .from('providers')
    .select('id, verification_status')
    .eq('user_id', user.id)
    .single();

  if (!provider) return { success: false, message: 'No provider profile found.' };

  const { data: verification, error } = await supabase
    .from('verifications')
    .insert({
      provider_id: provider.id,
      document_type: documentType,
      document_url: documentUrl,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) return { success: false, message: error.message };

  if (provider.verification_status === 'unverified') {
    await supabase
      .from('providers')
      .update({ verification_status: 'pending' })
      .eq('id', provider.id);
  }

  const { data: providerRow } = await supabase
    .from('providers')
    .select('business_name')
    .eq('id', provider.id)
    .single();

  await emitAutomationEvent('provider.verification_submitted', {
    providerId: provider.id,
    verificationId: verification.id,
    documentType,
    businessName: providerRow?.business_name ?? '',
  });

  revalidatePath('/pro/dashboard/settings/verification');
  return { success: true };
}
