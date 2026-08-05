import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { UserRow, UserRole } from '@/types/database';

/**
 * Resolves the currently authenticated user's full profile row.
 *
 * IMPORTANT: this used to call `.single()` and silently discard the `error`
 * from the query. `.single()` returns an error (not just empty data) when
 * zero rows match — which happens any time the `public.users` row for a
 * freshly authenticated `auth.users` record hasn't been created yet (OAuth
 * sign-ins, a trigger that failed once, a project where migrations ran out
 * of order, etc). Because the error was ignored, `profile` came back as
 * `undefined`, this function returned `null`, and every dashboard layout
 * treats `null` as "not logged in" and redirects to /login — even though
 * the person has a perfectly valid Supabase session. That is the "signs in
 * successfully, then gets bounced straight back to the login page" bug.
 *
 * Fix: use `.maybeSingle()` (doesn't error on 0 rows), log real errors so
 * they're visible instead of silently swallowed, and self-heal by creating
 * the missing profile row via the admin client if it's absent. This also
 * covers "automatically create a profile if one doesn't exist" for OAuth
 * sign-ins as a safety net on top of the `on_auth_user_created` DB trigger.
 */
export async function getCurrentUser(): Promise<UserRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('[auth] getUser() failed:', authError.message);
  }
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[auth] profile lookup failed for', user.id, '-', profileError.message);
  }

  if (profile) return profile as UserRow;

  // Authenticated with Supabase Auth, but no row in public.users yet.
  // Create it now instead of treating this person as logged out.
  console.warn('[auth] no profile row for', user.id, '- creating one now');

  const role: UserRole = user.user_metadata?.role === 'provider' ? 'provider' : 'customer';
  const admin = createAdminClient();
  const { data: created, error: createError } = await admin
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '',
        avatar_url: user.user_metadata?.avatar_url ?? null,
        role,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (createError) {
    console.error('[auth] self-heal profile creation failed for', user.id, '-', createError.message);
    return null;
  }

  return created as UserRow;
}
