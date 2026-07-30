import { getResendClient } from '@/lib/email/resend-client';
import { renderEmailLayout } from '@/lib/email/templates/layout';
import { siteConfig } from '@/lib/site-config';

const EMAIL_FROM = process.env.EMAIL_FROM ?? 'FixLocal <notifications@fixlocal.com>';

interface SendEmailParams {
  to: string;
  subject: string;
  previewText: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

/**
 * Sends a transactional email. Fails silently (logs only) so that a missing
 * or misconfigured RESEND_API_KEY never blocks the underlying booking/review
 * action it's attached to — email is a notification channel, not a critical
 * path dependency.
 */
export async function sendTransactionalEmail(params: SendEmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`RESEND_API_KEY not set — skipping email "${params.subject}" to ${params.to}`);
    return;
  }

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: renderEmailLayout({
        previewText: params.previewText,
        heading: params.heading,
        bodyHtml: params.bodyHtml,
        ctaLabel: params.ctaLabel,
        ctaUrl: params.ctaUrl,
      }),
    });
  } catch (error) {
    console.error('sendTransactionalEmail error', error);
  }
}

function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`;
}

export async function sendWelcomeEmail(to: string, fullName: string): Promise<void> {
  await sendTransactionalEmail({
    to,
    subject: 'Welcome to FixLocal',
    previewText: 'Your FixLocal account is ready.',
    heading: `Welcome, ${fullName.split(' ')[0]}!`,
    bodyHtml: `<p>Your account is ready. Search for trusted local pros, compare pricing, and book in minutes.</p>`,
    ctaLabel: 'Browse services',
    ctaUrl: absoluteUrl('/categories'),
  });
}

export async function sendBookingRequestEmail(params: {
  to: string;
  providerName: string;
  serviceTitle: string;
  scheduledAtLabel: string;
  bookingId: string;
}): Promise<void> {
  await sendTransactionalEmail({
    to: params.to,
    subject: 'Your booking request was sent',
    previewText: `Your request to ${params.providerName} is on its way.`,
    heading: 'Booking request sent',
    bodyHtml: `<p>Your request for <strong>${params.serviceTitle}</strong> with <strong>${params.providerName}</strong> on ${params.scheduledAtLabel} has been sent. We'll email you as soon as they respond.</p>`,
    ctaLabel: 'View booking',
    ctaUrl: absoluteUrl(`/dashboard/bookings/${params.bookingId}`),
  });
}

export async function sendNewBookingRequestEmail(params: {
  to: string;
  customerName: string;
  serviceTitle: string;
  scheduledAtLabel: string;
  bookingId: string;
}): Promise<void> {
  await sendTransactionalEmail({
    to: params.to,
    subject: 'New booking request',
    previewText: `${params.customerName} requested ${params.serviceTitle}`,
    heading: 'New booking request',
    bodyHtml: `<p><strong>${params.customerName}</strong> requested <strong>${params.serviceTitle}</strong> on ${params.scheduledAtLabel}. Respond promptly to keep your response rate up.</p>`,
    ctaLabel: 'Review request',
    ctaUrl: absoluteUrl(`/pro/dashboard/bookings/${params.bookingId}`),
  });
}

export async function sendBookingStatusEmail(params: {
  to: string;
  status: 'accepted' | 'declined' | 'completed' | 'cancelled';
  providerName: string;
  serviceTitle: string;
  bookingId: string;
}): Promise<void> {
  const copy: Record<typeof params.status, { subject: string; heading: string; body: string }> = {
    accepted: {
      subject: 'Your booking was accepted',
      heading: 'Booking confirmed',
      body: `<p><strong>${params.providerName}</strong> accepted your request for <strong>${params.serviceTitle}</strong>. We'll remind you before the appointment.</p>`,
    },
    declined: {
      subject: 'Your booking was declined',
      heading: 'Booking declined',
      body: `<p><strong>${params.providerName}</strong> wasn't able to take your request for <strong>${params.serviceTitle}</strong>. No charge was made — feel free to search for another pro.</p>`,
    },
    completed: {
      subject: 'Your job is complete — leave a review',
      heading: 'Job complete',
      body: `<p>Your <strong>${params.serviceTitle}</strong> booking with <strong>${params.providerName}</strong> is marked complete. Your receipt is available in your dashboard. Consider leaving a review!</p>`,
    },
    cancelled: {
      subject: 'Booking cancelled',
      heading: 'Booking cancelled',
      body: `<p>Your <strong>${params.serviceTitle}</strong> booking with <strong>${params.providerName}</strong> was cancelled. Any payment hold has been released.</p>`,
    },
  };

  const { subject, heading, body } = copy[params.status];

  await sendTransactionalEmail({
    to: params.to,
    subject,
    previewText: subject,
    heading,
    bodyHtml: body,
    ctaLabel: params.status === 'completed' ? 'Leave a review' : 'View booking',
    ctaUrl: absoluteUrl(
      `/dashboard/bookings/${params.bookingId}${params.status === 'completed' ? '?review=1' : ''}`
    ),
  });
}

export async function sendReceiptEmail(params: {
  to: string;
  invoiceNumber: string;
  totalFormatted: string;
  serviceTitle: string;
  invoiceUrl?: string;
}): Promise<void> {
  await sendTransactionalEmail({
    to: params.to,
    subject: `Your FixLocal receipt (#${params.invoiceNumber})`,
    previewText: `Receipt for ${params.serviceTitle} — ${params.totalFormatted}`,
    heading: 'Payment receipt',
    bodyHtml: `<p>Thanks for using FixLocal. Here's your receipt for <strong>${params.serviceTitle}</strong>.</p><p style="margin-top:12px;font-size:24px;font-weight:700;color:#09090B;">${params.totalFormatted}</p>`,
    ctaLabel: params.invoiceUrl ? 'View invoice' : undefined,
    ctaUrl: params.invoiceUrl,
  });
}
