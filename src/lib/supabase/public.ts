import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let publicClient: ReturnType<typeof createSupabaseJsClient<Database>> | null = null;

// `@supabase/supabase-js`'s createClient() throws synchronously if the URL
// is empty. That's fine for a page-level query wrapped in try/catch, but it
// is NOT fine when the constructor call itself happens to be reachable from
// a page Next.js tries to statically prerender at build time (categories,
// sitemap, even Next's own internal /_not-found page) — a thrown error
// there fails the *entire* Vercel build, not just that one page. Falling
// back to a syntactically-valid placeholder means the constructor never
// throws; a real query against the placeholder fails at request/build time
// with an ordinary network error instead, which every data-fetching
// function in this codebase already catches and degrades gracefully from.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

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
    publicClient = createSupabaseJsClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return publicClient;
}
