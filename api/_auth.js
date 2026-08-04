import { createHmac, timingSafeEqual } from 'node:crypto';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const decode = (value) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));

export function sign(payload, secret) {
  const body = encode(payload);
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verify(token, secret) {
  try {
    const [body, supplied] = String(token || '').split('.');
    if (!body || !supplied) return null;

    const expected = createHmac('sha256', secret).update(body).digest('base64url');
    if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;

    const payload = decode(body);
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

export function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
