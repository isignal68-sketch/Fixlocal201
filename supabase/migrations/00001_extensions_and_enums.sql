-- =============================================================================
-- FixLocal Database Schema
-- Migration 00001: Extensions and Enum Types
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "postgis";

create type user_role as enum ('customer', 'provider', 'admin');

create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');

create type booking_status as enum (
  'pending',
  'accepted',
  'declined',
  'in_progress',
  'completed',
  'cancelled'
);

create type price_type as enum ('fixed', 'hourly', 'quote');

create type payment_status as enum (
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded'
);

create type subscription_tier as enum ('free', 'starter', 'growth', 'pro');

create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');

create type notification_type as enum (
  'booking_request',
  'booking_accepted',
  'booking_declined',
  'booking_completed',
  'booking_cancelled',
  'new_message',
  'new_review',
  'review_reply',
  'payment_received',
  'payment_failed',
  'payout_sent',
  'system'
);

create type ticket_status as enum ('open', 'pending', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type discount_type as enum ('percent', 'fixed');
