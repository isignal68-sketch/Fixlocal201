export interface AutomationEventRow {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed' | 'exhausted';
  attempts: number;
  max_attempts: number;
  next_retry_at: string | null;
  last_error: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationWebhookDeliveryRow {
  id: string;
  event_id: string;
  attempt_number: number;
  target_url: string;
  request_headers: Record<string, unknown> | null;
  response_status: number | null;
  response_body: string | null;
  duration_ms: number | null;
  succeeded: boolean;
  error_message: string | null;
  created_at: string;
}
