import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

const CUSTOMER_ONLY_PREFIXES = ['/dashboard'];
const PROVIDER_ONLY_PREFIXES = ['/pro/dashboard'];
const ADMIN_ONLY_PREFIXES = ['/admin'];
const AUTH_PREFIXES = ['/login', '/signup', '/forgot-password'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isAuthRoute = AUTH_PREFIXES.some((p) => path.startsWith(p));
  const needsCustomer = CUSTOMER_ONLY_PREFIXES.some((p) => path.startsWith(p));
  const needsProvider = PROVIDER_ONLY_PREFIXES.some((p) => path.startsWith(p));
  const needsAdmin = ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p));

  if (!user && (needsCustomer || needsProvider || needsAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (user && (needsProvider || needsAdmin)) {
    const { data: profile, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (roleError) {
      console.error('[auth] middleware role lookup failed for', user.id, '-', roleError.message);
    }

    if (needsProvider && profile?.role !== 'provider' && profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (needsAdmin && profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
