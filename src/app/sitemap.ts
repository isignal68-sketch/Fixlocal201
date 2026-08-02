import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: 'daily', priority: 1 },
    { url: `${siteConfig.url}/categories`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteConfig.url}/search`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteConfig.url}/how-it-works`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteConfig.url}/pro/join`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteConfig.url}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteConfig.url}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteConfig.url}/legal/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteConfig.url}/legal/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // The sitemap is generated at build/export time — an unhandled error here
  // (missing env vars, DB unreachable, etc.) would otherwise take down the
  // *entire* deployment over what is fundamentally an SEO nice-to-have.
  // Degrade to static-routes-only rather than fail the build.
  try {
    const supabase = createAdminClient();

    const [{ data: categories }, { data: cities }, { data: providers }] = await Promise.all([
      supabase.from('categories').select('slug, created_at').eq('is_active', true),
      supabase.from('cities').select('slug, state_code').eq('is_active', true),
      supabase.from('providers').select('slug, updated_at').eq('verification_status', 'verified'),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map(
      (c: { slug: string; created_at: string }) => ({
        url: `${siteConfig.url}/categories/${c.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: c.created_at,
      })
    );

    const cityRoutes: MetadataRoute.Sitemap = (cities ?? []).map(
      (c: { slug: string; state_code: string }) => ({
        url: `${siteConfig.url}/locations/${c.state_code.toLowerCase()}/${c.slug}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    );

    const providerRoutes: MetadataRoute.Sitemap = (providers ?? []).map(
      (p: { slug: string; updated_at: string }) => ({
        url: `${siteConfig.url}/providers/${p.slug}`,
        changeFrequency: 'weekly',
        priority: 0.5,
        lastModified: p.updated_at,
      })
    );

    return [...staticRoutes, ...categoryRoutes, ...cityRoutes, ...providerRoutes];
  } catch (error) {
    console.warn('sitemap: Supabase-backed routes unavailable, returning static routes only:', error);
    return staticRoutes;
  }
}
