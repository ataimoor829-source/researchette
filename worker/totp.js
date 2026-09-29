/* Time-based one-time codes (RFC 6238), the 6-digit codes shown by Apple Passwords, Google
   Authenticator and similar apps: HMAC-SHA1 of the 30-second time step, 6 digits. */

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32(bytes) {
  let bits = 0, val = 0, out = '';
  for (const b of bytes) {
    val = ((val << 8) | b) & 0xffff; bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}
export function unbase32(s) {
  const out = [];
  let bits = 0, val = 0;
  for (const c of String(s).replace(/[\s=-]/g, '').toUpperCase()) {
    const i = B32.indexOf(c);
    if (i < 0) continue;
    val = ((val << 5) | i) & 0xffff; bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}
export function newSecret() { return base32(crypto.getRandomValues(new Uint8Array(20))); }

export async function totp(secret, step) {
  const key = await crypto.subtle.importKey('raw', unbase32(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const msg = new DataView(new ArrayBuffer(8));
  msg.setUint32(0, Math.floor(step / 2 ** 32)); msg.setUint32(4, step >>> 0);
  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg.buffer));
  const o = h[h.length - 1] & 15;
  const n = (((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1e6;
  return String(n).padStart(6, '0');
}
export const currentStep = (ms = Date.now()) => Math.floor(ms / 30000);

// Accepts the code for now, 30 s ago or 30 s ahead (phone clocks drift), but never a time step at or
// before lastStep, so a code can't be used twice. Returns the matching step, or 0.
export async function checkTotp(secret, code, lastStep, ms) {
  const c = String(code || '').replace(/\D/g, '');
  if (c.length !== 6) return 0;
  const now = currentStep(ms);
  for (const d of [0, -1, 1]) {
    const st = now + d;
    if (st <= (lastStep || 0)) continue;
    if ((await totp(secret, st)) === c) return st;
  }
  return 0;
}
