import { createClient } from '@/lib/supabase/server';
import type { CategoryRow, ProviderRow } from '@/types/database';

export async function getActiveCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getActiveCategories error', error.message);
    return [];
  }

  return (data as CategoryRow[]) ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data as CategoryRow;
}

export interface ProviderWithDistance extends ProviderRow {
  distance_miles?: number;
}

export async function getFeaturedProviders(limit = 8): Promise<ProviderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('verification_status', 'verified')
    .eq('is_featured', true)
    .order('average_rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getFeaturedProviders error', error.message);
    return [];
  }

  return (data as ProviderRow[]) ?? [];
}

export async function getTopRatedProviders(limit = 8): Promise<ProviderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('verification_status', 'verified')
    .gte('review_count', 1)
    .order('average_rating', { ascending: false })
    .order('review_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getTopRatedProviders error', error.message);
    return [];
  }

  return (data as ProviderRow[]) ?? [];
}

export async function getProviderBySlug(slug: string): Promise<ProviderRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('providers').select('*').eq('slug', slug).single();

  if (error) return null;
  return data as ProviderRow;
}

export interface SearchProvidersParams {
  query?: string;
  categorySlug?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  minRating?: number;
  sort?: 'rating' | 'reviews' | 'newest' | 'distance';
  page?: number;
  perPage?: number;
}

export interface SearchProvidersResult {
  providers: ProviderRow[];
  total: number;
  page: number;
  perPage: number;
  distanceByProviderId?: Record<string, number>;
}

export async function searchProviders(
  params: SearchProvidersParams
): Promise<SearchProvidersResult> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Proximity search: either explicit coordinates (e.g. "use my location") or
  // a ZIP code resolved to coordinates. Both funnel through the same PostGIS RPC.
  let searchCoords: { lat: number; lng: number } | null = null;

  if (params.lat !== undefined && params.lng !== undefined) {
    searchCoords = { lat: params.lat, lng: params.lng };
  } else if (params.zipCode) {
    const { data: zip } = await supabase
      .from('zip_codes')
      .select('latitude, longitude')
      .eq('zip_code', params.zipCode)
      .maybeSingle();

    if (!zip) {
      return { providers: [], total: 0, page, perPage };
    }
    searchCoords = { lat: zip.latitude, lng: zip.longitude };
  }

  if (searchCoords) {
    const { data: nearby, error: nearbyError } = await supabase.rpc('nearby_providers', {
      search_lat: searchCoords.lat,
      search_lng: searchCoords.lng,
      radius_miles: params.radiusMiles ?? 50,
    });

    if (nearbyError || !nearby || nearby.length === 0) {
      return { providers: [], total: 0, page, perPage };
    }

    const distanceByProviderId: Record<string, number> = {};
    for (const row of nearby) {
      distanceByProviderId[row.provider_id] = row.distance_miles;
    }

    let providerQuery = supabase
      .from('providers')
      .select('*, services!inner(category_id, categories!inner(slug))')
      .in('id', Object.keys(distanceByProviderId));

    if (params.query) providerQuery = providerQuery.ilike('business_name', `%${params.query}%`);
    if (params.categorySlug) providerQuery = providerQuery.eq('services.categories.slug', params.categorySlug);
    if (params.minRating) providerQuery = providerQuery.gte('average_rating', params.minRating);

    const { data: providers } = await providerQuery;
    const results = ((providers as unknown as ProviderRow[]) ?? []).filter(
      (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
    );

    results.sort((a, b) => {
      if (params.sort === 'rating') return b.average_rating - a.average_rating;
      if (params.sort === 'reviews') return b.review_count - a.review_count;
      return (distanceByProviderId[a.id] ?? 0) - (distanceByProviderId[b.id] ?? 0);
    });

    const total = results.length;
    const paged = results.slice(from, to + 1);

    return { providers: paged, total, page, perPage, distanceByProviderId };
  }

  let queryBuilder = supabase
    .from('providers')
    .select('*, services!inner(category_id, categories!inner(slug))', { count: 'exact' })
    .eq('verification_status', 'verified');

  if (params.query) {
    queryBuilder = queryBuilder.ilike('business_name', `%${params.query}%`);
  }

  if (params.categorySlug) {
    queryBuilder = queryBuilder.eq('services.categories.slug', params.categorySlug);
  }

  if (params.minRating) {
    queryBuilder = queryBuilder.gte('average_rating', params.minRating);
  }

  switch (params.sort) {
    case 'reviews':
      queryBuilder = queryBuilder.order('review_count', { ascending: false });
      break;
    case 'newest':
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
    default:
      queryBuilder = queryBuilder.order('average_rating', { ascending: false });
  }

  const { data, error, count } = await queryBuilder.range(from, to);

  if (error) {
    console.error('searchProviders error', error.message);
    return { providers: [], total: 0, page, perPage };
  }

  return {
    providers: (data as unknown as ProviderRow[]) ?? [],
    total: count ?? 0,
    page,
    perPage,
  };
}
