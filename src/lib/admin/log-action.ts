import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/supabase';

export async function logAdminAction(
  action: string,
  targetTable?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action,
    target_table: targetTable ?? null,
    target_id: targetId ?? null,
    metadata: (metadata ?? null) as Json | null,
  });
}
