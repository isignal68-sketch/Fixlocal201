import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let publicClient: ReturnType<typeof createSupabaseJsClient<Database>> | null = null;

/**
 * A plain anon-key Supabase client with no dependency on `cookies()`,
 * `headers()`, or any other per-request API. Safe to call from anywhere,
 * including `generateStaticParams`, `generateMetadata`, and build-time
 * rendering — none of which have an incoming request to read cookies from.
 *
 * Use this for any read that doesn't need the visitor's session (public
 * categories, verified provider listings, active services, published
 * reviews, etc.) — i.e. anything already readable by an anonymous visitor
 * under RLS. Use `@/lib/supabase/server` instead the moment a query needs
 * `auth.uid()` to resolve (favorites, "is this my own listing", etc.).
 */
export function createPublicClient() {
  if (!publicClient) {
    publicClient = createSupabaseJsClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return publicClient;
}
