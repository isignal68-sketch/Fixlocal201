import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServiceForBooking, getAvailableSlots } from '@/lib/data/booking-flow';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { createClient } from '@/lib/supabase/server';
import { BookingFlowForm } from '@/components/shared/booking-flow-form';
import type { PaymentMethodRow } from '@/types/database';

interface BookingPageProps {
  params: Promise<{ providerSlug: string; serviceSlug: string }>;
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { providerSlug, serviceSlug } = await params;
  const context = await getServiceForBooking(providerSlug, serviceSlug);
  if (!context) return {};

  return {
    title: `Book ${context.service.title} with ${context.provider.business_name}`,
    robots: { index: false, follow: false },
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { providerSlug, serviceSlug } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/book/${providerSlug}/${serviceSlug}`);

  const context = await getServiceForBooking(providerSlug, serviceSlug);
  if (!context) notFound();

  const { service, provider } = context;

  const [slotsByDate, supabase] = await Promise.all([
    getAvailableSlots(provider.id, service.duration_minutes ?? 60),
    createClient(),
  ]);

  const { data: paymentMethodsData } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  const paymentMethods = (paymentMethodsData as PaymentMethodRow[]) ?? [];

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Book {service.title}</h1>
        <p className="mt-1 text-muted-foreground">with {provider.business_name}</p>
      </div>

      <BookingFlowForm
        service={service}
        provider={provider}
        slotsByDate={slotsByDate}
        paymentMethods={paymentMethods}
        user={user}
      />
    </div>
  );
}
