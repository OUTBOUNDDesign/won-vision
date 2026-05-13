import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.OPS_VISION_SECRET;
const SIGNATURE_HEADER = 'x-signature';
const IDEMPOTENCY_HEADER = 'idempotency-key';
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_KEYS = 10_000;

const seen = new Map<string, number>();

function pruneSeen() {
  if (seen.size <= MAX_KEYS) return;
  const cutoff = Date.now() - TTL_MS;
  for (const [k, t] of seen) {
    if (t < cutoff) seen.delete(k);
  }
  if (seen.size > MAX_KEYS) {
    const oldestFirst = [...seen.entries()].sort((a, b) => a[1] - b[1]);
    for (const [k] of oldestFirst.slice(0, seen.size - MAX_KEYS)) seen.delete(k);
  }
}

export function sign(rawBody: string): string {
  if (!SECRET) throw new Error('OPS_VISION_SECRET not set');
  return 'sha256=' + createHmac('sha256', SECRET).update(rawBody).digest('hex');
}

export type VerifyResult =
  | { ok: true; idempotencyKey: string }
  | { ok: false; status: 401 | 409 | 400; reason: string };

export function verify(headers: Headers, rawBody: string): VerifyResult {
  if (!SECRET) return { ok: false, status: 401, reason: 'server-missing-secret' };

  const signature = headers.get(SIGNATURE_HEADER);
  const idempotencyKey = headers.get(IDEMPOTENCY_HEADER);
  if (!signature) return { ok: false, status: 401, reason: 'missing-signature' };
  if (!idempotencyKey) return { ok: false, status: 400, reason: 'missing-idempotency-key' };

  const expected = sign(rawBody);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, status: 401, reason: 'bad-signature' };
  }

  const seenAt = seen.get(idempotencyKey);
  if (seenAt && Date.now() - seenAt < TTL_MS) {
    return { ok: false, status: 409, reason: 'replay' };
  }
  seen.set(idempotencyKey, Date.now());
  pruneSeen();

  return { ok: true, idempotencyKey };
}
