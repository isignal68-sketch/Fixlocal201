'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const reportSchema = z
  .object({
    reportedProviderId: z.string().uuid().optional(),
    reportedReviewId: z.string().uuid().optional(),
    reason: z.string().trim().min(3).max(150),
    details: z.string().trim().max(1000).optional(),
  })
  .refine((data) => !!data.reportedProviderId || !!data.reportedReviewId, {
    message: 'A report must target a provider or a review.',
  });

export interface ReportSubmissionResult {
  success: boolean;
  message?: string;
}

export async function submitReportAction(
  input: z.infer<typeof reportSchema>
): Promise<ReportSubmissionResult> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Please provide a reason for the report.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'You must be signed in to submit a report.' };

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_provider_id: parsed.data.reportedProviderId || null,
    reported_review_id: parsed.data.reportedReviewId || null,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });

  if (error) return { success: false, message: error.message };

  return { success: true };
}
