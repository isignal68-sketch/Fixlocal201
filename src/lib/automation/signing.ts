import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Computes an HMAC-SHA256 signature over a raw request body, hex-encoded.
 * Used both to sign outbound requests to n8n and to verify inbound
 * requests from n8n — same primitive, different secrets.
 */
export function signPayload(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
}

/**
 * Constant-time signature comparison to avoid timing attacks when
 * verifying inbound webhook signatures.
 */
export function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;

  const expected = signPayload(rawBody, secret);
  const expectedBuf = Buffer.from(expected, 'hex');
  const providedBuf = Buffer.from(signature, 'hex');

  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
