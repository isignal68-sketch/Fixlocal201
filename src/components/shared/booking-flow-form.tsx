'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { CalendarClock, MapPin, FileText, CreditCard } from 'lucide-react';
import { createBookingAction } from '@/lib/actions/create-booking';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TimeSlotPicker } from '@/components/shared/time-slot-picker';
import { PaymentMethodSelector } from '@/components/shared/payment-method-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ServiceRow, ProviderRow, PaymentMethodRow, UserRow } from '@/types/database';
import type { TimeSlot } from '@/lib/data/booking-flow';

function estimatePriceCents(service: ServiceRow): number {
  if (service.price_type === 'fixed' && service.price_min_cents) return service.price_min_cents;
  if (service.price_type === 'hourly' && service.price_min_cents) {
    return Math.round((service.price_min_cents * (service.duration_minutes ?? 60)) / 60);
  }
  if (service.price_min_cents) return service.price_min_cents;
  return 0;
}

export function BookingFlowForm({
  service,
  provider,
  slotsByDate,
  paymentMethods,
  user,
}: {
  service: ServiceRow;
  provider: ProviderRow;
  slotsByDate: Record<string, TimeSlot[]>;
  paymentMethods: PaymentMethodRow[];
  user: UserRow;
}) {
  const [selectedIso, setSelectedIso] = React.useState<string | null>(null);
  const [addressLine1, setAddressLine1] = React.useState('');
  const [addressLine2, setAddressLine2] = React.useState('');
  const [city, setCity] = React.useState(user.city ?? '');
  const [state, setState] = React.useState(user.state ?? '');
  const [zipCode, setZipCode] = React.useState(user.zip_code ?? '');
  const [notes, setNotes] = React.useState('');
  const [paymentMethodId, setPaymentMethodId] = React.useState<string | null>(
    paymentMethods.find((m) => m.is_default)?.id ?? paymentMethods[0]?.id ?? null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const durationMinutes = service.duration_minutes ?? 60;
  const priceCents = estimatePriceCents(service);
  const isQuoteOnly = service.price_type === 'quote' || priceCents === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedIso) {
      toast.error('Choose a date and time.');
      return;
    }
    if (!addressLine1 || !city || !state || !zipCode) {
      toast.error('Fill in the service address.');
      return;
    }
    if (!isQuoteOnly && !paymentMethodId) {
      toast.error('Select a payment method.');
      return;
    }

    setIsSubmitting(true);

    const result = await createBookingAction({
      providerId: provider.id,
      serviceId: service.id,
      scheduledAt: selectedIso,
      durationMinutes,
      addressLine1,
      addressLine2,
      city,
      state: state.toUpperCase(),
      zipCode,
      notes,
      priceCents,
      paymentMethodId: paymentMethodId ?? undefined,
    });

    setIsSubmitting(false);

    if (result && !result.success) {
      toast.error(result.message ?? 'Could not create booking.');
    }
  }

  const platformFee = Math.round(priceCents * 0.15);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4" />
              Choose a time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeSlotPicker slotsByDate={slotsByDate} selectedIso={selectedIso} onSelect={setSelectedIso} />
            {selectedIso && (
              <p className="mt-3 text-sm text-muted-foreground">
                Selected: {formatDate(selectedIso, { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4" />
              Service address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Address line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
            />
            <Input
              placeholder="Apt, suite, etc. (optional)"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input
                placeholder="State"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input placeholder="ZIP" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Notes for the provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              placeholder="Anything the provider should know before arriving?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        {!isQuoteOnly && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="size-4" />
                Payment method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector
                methods={paymentMethods}
                selectedId={paymentMethodId}
                onSelect={setPaymentMethodId}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{service.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">with {provider.business_name}</p>

            {isQuoteOnly ? (
              <p className="rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
                This provider will confirm final pricing after reviewing your request.
              </p>
            ) : (
              <div className="space-y-1.5 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated price</span>
                  <span>{formatCurrency(priceCents - platformFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(priceCents)}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="mt-2 w-full" size="lg" isLoading={isSubmitting}>
              Request booking
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You won&apos;t be charged until the provider accepts and the job is complete.
            </p>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
