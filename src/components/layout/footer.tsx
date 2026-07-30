import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { footerNav, siteConfig } from '@/lib/site-config';

const columns = [
  { title: 'Company', items: footerNav.company },
  { title: 'Support', items: footerNav.support },
  { title: 'For providers', items: footerNav.providers },
  { title: 'Legal', items: footerNav.legal },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-brand font-display text-sm font-bold text-white">
                F
              </div>
              <span className="font-display text-lg font-semibold">FixLocal</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The trusted way to find and book local service pros — from a quick repair to a full
              remodel.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={siteConfig.links.facebook}
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href={siteConfig.links.instagram}
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={siteConfig.links.twitter}
                aria-label="Twitter"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href={siteConfig.links.linkedin}
                aria-label="LinkedIn"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FixLocal, Inc. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">Made for homeowners across the US.</p>
        </div>
      </div>
    </footer>
  );
}
