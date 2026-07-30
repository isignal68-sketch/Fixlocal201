import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="container py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand px-8 py-16 text-center text-white sm:px-16">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Ready to get it done?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            Join thousands of homeowners who found their trusted pro on FixLocal.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/search">Find a pro</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/pro/join">Grow your business</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
