import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

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

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')
    .eq('is_active', true);

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map(
    (c: { slug: string; created_at: string }) => ({
      url: `${siteConfig.url}/categories/${c.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: c.created_at,
    })
  );

  const { data: cities } = await supabase.from('cities').select('slug, state_code').eq('is_active', true);

  const cityRoutes: MetadataRoute.Sitemap = (cities ?? []).map(
    (c: { slug: string; state_code: string }) => ({
      url: `${siteConfig.url}/locations/${c.state_code.toLowerCase()}/${c.slug}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  );

  const { data: providers } = await supabase
    .from('providers')
    .select('slug, updated_at')
    .eq('verification_status', 'verified');

  const providerRoutes: MetadataRoute.Sitemap = (providers ?? []).map(
    (p: { slug: string; updated_at: string }) => ({
      url: `${siteConfig.url}/providers/${p.slug}`,
      changeFrequency: 'weekly',
      priority: 0.5,
      lastModified: p.updated_at,
    })
  );

  return [...staticRoutes, ...categoryRoutes, ...cityRoutes, ...providerRoutes];
}
