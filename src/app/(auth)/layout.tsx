import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

const highlights = [
  'Vetted, background-checked local pros',
  'Transparent upfront pricing',
  'Secure payments held until the job is done',
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link href="/" className="mb-10 inline-flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-brand font-display text-sm font-bold text-white">
            F
          </div>
          <span className="font-display text-lg font-semibold">FixLocal</span>
        </Link>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-brand lg:flex lg:flex-col lg:justify-end">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="relative z-10 p-16 text-white">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            The easiest way to get things fixed, cleaned, and built.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/90">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
