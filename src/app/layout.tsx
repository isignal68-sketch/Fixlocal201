import type { Metadata, Viewport } from 'next';
import { Inter, Lexend } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FixLocal — Book trusted local service pros near you',
    template: '%s | FixLocal',
  },
  description:
    'Find and book vetted, verified local service providers for plumbing, electrical, cleaning, HVAC, remodeling, and more. Compare prices, read reviews, and book in minutes.',
  keywords: [
    'local services',
    'home services',
    'find a plumber',
    'find an electrician',
    'home service marketplace',
    'book a handyman',
  ],
  authors: [{ name: 'FixLocal' }],
  creator: 'FixLocal',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'FixLocal',
    title: 'FixLocal — Book trusted local service pros near you',
    description:
      'Find and book vetted, verified local service providers near you. Compare prices, read reviews, and book in minutes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FixLocal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FixLocal — Book trusted local service pros near you',
    description:
      'Find and book vetted, verified local service providers near you. Compare prices, read reviews, and book in minutes.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lexend.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
