import { HeroSearchBar } from '@/components/shared/hero-search-bar';

const stats = [
  { label: 'Verified pros', value: '38,000+' },
  { label: 'Jobs completed', value: '1.2M+' },
  { label: 'Average rating', value: '4.8/5' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-mesh">
      <div className="container flex flex-col items-center py-20 text-center sm:py-28">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground">
          <span className="flex size-2 rounded-full bg-accent" />
          Now serving 16 metro areas
        </div>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          Get it fixed by <span className="text-gradient">trusted local pros</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Compare vetted providers, see transparent pricing, and book in minutes — for
          everything from a leaky faucet to a full kitchen remodel.
        </p>

        <div className="relative mt-10 w-full max-w-xl">
          <HeroSearchBar />
        </div>

        <div className="mt-14 grid grid-cols-3 gap-8 sm:gap-16">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
