import { createClient } from '@/lib/supabase/server';
import type { UserRow } from '@/types/database';

export async function getCurrentUser(): Promise<UserRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (profile as UserRow) ?? null;
}
