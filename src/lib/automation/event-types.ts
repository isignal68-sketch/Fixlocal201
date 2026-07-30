/**
 * Central catalog of every domain event FixLocal emits toward n8n.
 *
 * To add a new automation trigger point:
 *   1. Add the event name to `AutomationEventType` below.
 *   2. Add its payload shape to `AutomationEventPayloadMap`.
 *   3. Call `emitAutomationEvent('your.event', payload)` from the server
 *      action / route handler where it happens.
 *
 * That's it — delivery, signing, logging, and retries are handled centrally
 * by `emit-event.ts`. No n8n workflow changes are required in this repo;
 * those live in the n8n instance itself (see /n8n-workflows for importable
 * starter workflows and /docs/N8N_INTEGRATION.md for the full guide).
 */

export type AutomationEventType =
  | 'user.registered'
  | 'provider.registered'
  | 'provider.verification_submitted'
  | 'provider.verification_updated'
  | 'booking.created'
  | 'booking.accepted'
  | 'booking.declined'
  | 'booking.completed'
  | 'booking.cancelled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'review.created'
  | 'review.replied'
  | 'message.sent'
  | 'support_ticket.created'
  | 'support_ticket.updated';

interface UserRegisteredPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'customer' | 'provider';
}

interface ProviderRegisteredPayload {
  providerId: string;
  userId: string;
  businessName: string;
  email: string;
  city: string;
  state: string;
}

interface ProviderVerificationSubmittedPayload {
  providerId: string;
  verificationId: string;
  documentType: string;
  businessName: string;
}

interface ProviderVerificationUpdatedPayload {
  providerId: string;
  status: 'verified' | 'rejected' | 'pending' | 'unverified';
  businessName: string;
  providerEmail: string;
}

interface BookingBasePayload {
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  providerId: string;
  providerUserId: string;
  providerName: string;
  providerEmail: string;
  serviceTitle: string;
  scheduledAt: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  priceCents: number;
}

type BookingCreatedPayload = BookingBasePayload;
type BookingAcceptedPayload = BookingBasePayload;
type BookingCompletedPayload = BookingBasePayload;

interface BookingDeclinedPayload extends BookingBasePayload {
  reason: string | null;
}

interface BookingCancelledPayload extends BookingBasePayload {
  reason: string | null;
  cancelledBy: 'customer' | 'provider' | 'admin';
}

interface PaymentEventPayload {
  bookingId: string;
  paymentIntentId: string;
  amountCents: number;
  customerId: string;
  providerId: string;
}

interface SubscriptionEventPayload {
  providerId: string;
  providerEmail: string;
  businessName: string;
  tier: 'free' | 'starter' | 'growth' | 'pro';
  stripeSubscriptionId: string | null;
}

interface ReviewCreatedPayload {
  reviewId: string;
  bookingId: string;
  providerId: string;
  providerUserId: string;
  customerName: string;
  rating: number;
  comment: string | null;
}

interface ReviewRepliedPayload {
  reviewId: string;
  providerId: string;
  customerId: string;
  reply: string;
}

interface MessageSentPayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  recipientEmail: string;
  bodyPreview: string;
  hasImage: boolean;
}

interface SupportTicketCreatedPayload {
  ticketId: string;
  userId: string;
  userEmail: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface SupportTicketUpdatedPayload {
  ticketId: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  userEmail: string;
}

export interface AutomationEventPayloadMap {
  'user.registered': UserRegisteredPayload;
  'provider.registered': ProviderRegisteredPayload;
  'provider.verification_submitted': ProviderVerificationSubmittedPayload;
  'provider.verification_updated': ProviderVerificationUpdatedPayload;
  'booking.created': BookingCreatedPayload;
  'booking.accepted': BookingAcceptedPayload;
  'booking.declined': BookingDeclinedPayload;
  'booking.completed': BookingCompletedPayload;
  'booking.cancelled': BookingCancelledPayload;
  'payment.succeeded': PaymentEventPayload;
  'payment.failed': PaymentEventPayload;
  'payment.refunded': PaymentEventPayload;
  'subscription.created': SubscriptionEventPayload;
  'subscription.updated': SubscriptionEventPayload;
  'subscription.canceled': SubscriptionEventPayload;
  'review.created': ReviewCreatedPayload;
  'review.replied': ReviewRepliedPayload;
  'message.sent': MessageSentPayload;
  'support_ticket.created': SupportTicketCreatedPayload;
  'support_ticket.updated': SupportTicketUpdatedPayload;
}
