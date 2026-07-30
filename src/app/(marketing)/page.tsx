import type { Metadata } from 'next';
import { HeroSection } from '@/components/shared/hero-section';
import { CategoriesSection } from '@/components/shared/categories-section';
import {
  FeaturedProvidersSection,
  TopRatedProvidersSection,
} from '@/components/shared/provider-sections';
import { HowItWorksSection } from '@/components/shared/how-it-works-section';
import { TestimonialsSection } from '@/components/shared/testimonials-section';
import { CtaSection } from '@/components/shared/cta-section';
import { getActiveCategories, getFeaturedProviders, getTopRatedProviders } from '@/lib/data/providers';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'FixLocal — Book trusted local service pros near you',
  alternates: { canonical: siteConfig.url },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, featuredProviders, topRatedProviders] = await Promise.all([
    getActiveCategories(),
    getFeaturedProviders(),
    getTopRatedProviders(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <CategoriesSection categories={categories} />
      <FeaturedProvidersSection providers={featuredProviders} />
      <HowItWorksSection />
      <TopRatedProvidersSection providers={topRatedProviders} />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
