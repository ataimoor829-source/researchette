/* Researchette API (Cloudflare Worker + D1).
   Serves /api/* and hands every other request to the static site in ./public.
   Passwords are hashed with PBKDF2-SHA256; sessions are random tokens in an HttpOnly cookie,
   stored only as a SHA-256 hash. Phone numbers and application answers are encrypted in the
   database with AES-256-GCM, using the DATA_KEY secret set in Cloudflare (never in this code).
   /mcp, /oauth/* and /.well-known/oauth-* are the MCP connector (see connector.js). */
import { connector } from './connector.js';

// Number of steps in each programme. Keep in sync with public/assets/curriculum.js.
const TRACK_STEPS = { original: 10, case: 6, letter: 4, synopsis: 6, thesis: 6, meta: 7 };
const GOALS = { 'Original article': 'original', 'Synopsis': 'synopsis', 'Thesis': 'thesis', 'Meta-analysis': 'meta', 'Systematic review / meta-analysis': 'meta', 'Case report': 'case', 'Letter to the editor': 'letter' };
const TRACK_NAMES = { original: 'Original article', case: 'Case report', letter: 'Letter to the editor', synopsis: 'Synopsis', thesis: 'Thesis', meta: 'Systematic review & meta-analysis' };
const COOKIE = 'rt_s';
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), p = url.pathname;
    if (p === '/mcp' || p.startsWith('/oauth/') || p.startsWith('/.well-known/oauth') || p === '/.well-known/openid-configuration') {
      try {
        return await connector(request, env, ctx, url, CONNECTOR_API);
      } catch (e) {
        console.error(e);
        return json({ error: 'server_error', error_description: 'Something went wrong. Please try again.' }, 500);
      }
    }
    if (!p.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      return await route(request, env, url, ctx);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
  }
};

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const bad = (m) => new HttpError(400, m);

const SECURITY = {
  'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains', 'content-security-policy': "default-src 'none'; frame-ancestors 'none'"
};
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...SECURITY, ...headers } });
}
async function body(request) {
  try { return await request.json(); } catch { throw bad('Invalid request.'); }
}
function str(v, max = 2000) { return String(v == null ? '' : v).trim().slice(0, max); }
function now() { return new Date().toISOString(); }
// Passwords ignore spaces at the start and end, so a copied password with a stray space still works.
function pw(v) { return String(v == null ? '' : v).trim(); }
function daysAgo(d) { return new Date(Date.now() - d * 864e5).toISOString(); }

/* ---------- crypto ---------- */
const enc = new TextEncoder();
function b64(buf) { let s = ''; new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); }); return btoa(s); }
function fromB64(s) { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }
function hex(buf) { return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
function randomId(prefix) { return prefix + hex(crypto.getRandomValues(new Uint8Array(8))); }
async function hashPassword(password, saltB64) {
  const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS }, key, 256);
  return { hash: b64(bits), salt: b64(salt) };
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
function tempPassword() {
  const a = 'abcdefghjkmnpqrstuvwxyz', r = crypto.getRandomValues(new Uint32Array(5));
  let out = ''; for (let i = 0; i < 4; i++) out += a[r[i] % a.length];
  return 'rt-' + out + '-' + (1000 + (r[4] % 9000));
}

/* ---------- encryption of personal data ----------
   Encrypted values look like "enc1:<iv>:<ciphertext>". Without DATA_KEY the site still works and
   stores plain text; once the key is added, older plain values are encrypted on the next mentor visit. */
const SEALED = { users: ['phone'], applications: ['phone', 'why'] };
let keyFor = null, keyPromise = null;
function dataKey(env) {
  if (!env.DATA_KEY) return null;
  if (keyFor !== env.DATA_KEY) {
    keyFor = env.DATA_KEY;
    keyPromise = crypto.subtle.importKey('raw', fromB64(env.DATA_KEY.trim()), 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  return keyPromise;
}
async function seal(env, value) {
  const v = value == null ? '' : String(value);
  const key = v && await dataKey(env);
  if (!key) return v;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return 'enc1:' + b64(iv) + ':' + b64(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(v)));
}
async function unseal(env, value) {
  if (!value || !String(value).startsWith('enc1:')) return value || '';
  const key = await dataKey(env);
  if (!key) return '';
  try {
    const [, iv, data] = value.split(':');
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, key, fromB64(data)));
  } catch { return ''; }
}
// decrypt the given fields of one row or a list of rows, in place
async function openRows(env, rows, fields) {
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  await Promise.all(list.flatMap((r) => fields.map(async (f) => { if (r[f]) r[f] = await unseal(env, r[f]); })));
  return rows;
}
const openUsers = (env, rows) => openRows(env, rows, SEALED.users);
let migrated = false;
async function sealExisting(env) {
  if (migrated || !env.DATA_KEY) return;
  migrated = true;
  try {
    const updates = [];
    for (const [table, fields] of Object.entries(SEALED)) {
      for (const f of fields) {
        const { results } = await env.DB.prepare(`SELECT id, ${f} AS v FROM ${table} WHERE ${f} != '' AND ${f} NOT LIKE 'enc1:%'`).all();
        for (const r of results) updates.push(env.DB.prepare(`UPDATE ${table} SET ${f} = ? WHERE id = ?`).bind(await seal(env, r.v), r.id));
      }
    }
    if (updates.length) await env.DB.batch(updates);
  } catch (e) { migrated = false; console.error('sealExisting', e); }
}

/* ---------- extra tables, created on first use so a deploy needs no manual database step ---------- */
const EXTRA_SCHEMA = [
  "CREATE TABLE IF NOT EXISTS activity (id TEXT PRIMARY KEY, type TEXT NOT NULL, summary TEXT NOT NULL, detail TEXT DEFAULT '', member_id TEXT, actor_id TEXT, link TEXT DEFAULT '', created_at TEXT NOT NULL)",
  'CREATE INDEX IF NOT EXISTS activity_time ON activity (created_at)',
  'CREATE TABLE IF NOT EXISTS oauth_clients (client_id TEXT PRIMARY KEY, secret_hash TEXT, name TEXT, redirect_uris TEXT NOT NULL, created_at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS oauth_codes (code_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, user_id TEXT NOT NULL, redirect_uri TEXT NOT NULL, challenge TEXT NOT NULL, scope TEXT, resource TEXT, expires TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS oauth_tokens (token_hash TEXT PRIMARY KEY, kind TEXT NOT NULL, client_id TEXT NOT NULL, user_id TEXT NOT NULL, scope TEXT, resource TEXT, expires TEXT NOT NULL, created_at TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS oauth_tokens_user ON oauth_tokens (user_id, client_id)',
  "CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, member_id TEXT NOT NULL, sender_id TEXT NOT NULL, sender_role TEXT NOT NULL, body TEXT NOT NULL, context TEXT DEFAULT '', created_at TEXT NOT NULL)",
  'CREATE INDEX IF NOT EXISTS messages_member ON messages (member_id, created_at)',
  'CREATE TABLE IF NOT EXISTS chat_reads (member_id TEXT NOT NULL, reader_id TEXT NOT NULL, last_read TEXT NOT NULL, PRIMARY KEY (member_id, reader_id))'
];
let schemaReady = null;
function ensureSchema(env) {
  if (!schemaReady) schemaReady = env.DB.batch(EXTRA_SCHEMA.map((q) => env.DB.prepare(q))).catch((e) => { schemaReady = null; throw e; });
  return schemaReady;
}

/* ---------- activity log ----------
   Everything members and mentors do is written here, so the connector can answer "what's new
   since…". The details are encrypted like phone numbers. */
function record(env, ctx, type, summary, rows, link, actorId, memberId) {
  const detail = {};
  rows.forEach(([k, v]) => { if (v !== '' && v != null) detail[k] = v; });
  const p = (async () => {
    await ensureSchema(env);
    await env.DB.prepare('INSERT INTO activity (id, type, summary, detail, member_id, actor_id, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(randomId('e'), type, summary, await seal(env, JSON.stringify(detail)), memberId || null, actorId || null, link || '', now()).run();
  })().catch((e) => console.error('activity log failed', e));
  if (ctx && ctx.waitUntil) ctx.waitUntil(p);
  return p;
}
// sign out connected apps for a user (after a password change, or when they disconnect one)
async function revokeApps(env, userId, clientId) {
  await ensureSchema(env);
  if (clientId) await env.DB.prepare('DELETE FROM oauth_tokens WHERE user_id = ? AND client_id = ?').bind(userId, clientId).run();
  else await env.DB.prepare('DELETE FROM oauth_tokens WHERE user_id = ?').bind(userId).run();
}
const trackName = (t) => TRACK_NAMES[t] || t;

/* ---------- chat ----------
   One conversation per member, shared by all mentors. Messages are encrypted like phone numbers;
   chat_reads remembers when each person last read each conversation, for unread counts. */
async function chatMessages(env, memberId, after) {
  await ensureSchema(env);
  const { results } = await env.DB.prepare('SELECT m.*, u.name AS sender_name FROM messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.member_id = ? AND m.created_at > ? ORDER BY m.created_at ASC LIMIT 500')
    .bind(memberId, after || '').all();
  return Promise.all(results.map(async (r) => ({ id: r.id, senderId: r.sender_id, senderName: r.sender_name || (r.sender_role === 'admin' ? 'Mentor' : 'Member'), role: r.sender_role, body: await unseal(env, r.body), context: r.context || '', at: r.created_at })));
}
async function markRead(env, memberId, readerId) {
  await env.DB.prepare('INSERT INTO chat_reads (member_id, reader_id, last_read) VALUES (?, ?, ?) ON CONFLICT (member_id, reader_id) DO UPDATE SET last_read = excluded.last_read')
    .bind(memberId, readerId, now()).run();
}
async function sendMessage(env, ctx, memberId, sender, text, context) {
  const bodyText = str(text, 4000);
  if (!bodyText) throw bad('Write a message first.');
  await ensureSchema(env);
  const id = randomId('c'), at = now();
  await env.DB.prepare('INSERT INTO messages (id, member_id, sender_id, sender_role, body, context, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, memberId, sender.id, sender.role, await seal(env, bodyText), str(context, 160), at).run();
  await markRead(env, memberId, sender.id);
  return { id, senderId: sender.id, senderName: sender.name, role: sender.role, body: bodyText, context: str(context, 160), at };
}
// messages from the other side that this reader hasn't seen yet, per conversation
async function unreadFor(env, reader) {
  await ensureSchema(env);
  const other = reader.role === 'admin' ? 'member' : 'admin';
  const scope = reader.role === 'admin' ? '' : ' AND m.member_id = ?';
  const { results } = await env.DB.prepare('SELECT m.member_id, COUNT(*) AS n FROM messages m LEFT JOIN chat_reads r ON r.member_id = m.member_id AND r.reader_id = ? WHERE m.sender_role = ? AND m.created_at > COALESCE(r.last_read, \'\')' + scope + ' GROUP BY m.member_id')
    .bind(...(reader.role === 'admin' ? [reader.id, other] : [reader.id, other, reader.id])).all();
  const by = {}; let total = 0;
  results.forEach((r) => { by[r.member_id] = r.n; total += r.n; });
  return { total, by };
}

/* ---------- users & sessions ---------- */
function pub(u) {
  if (!u) return null;
  return {
    id: u.id, role: u.role, name: u.name, email: u.email, phone: u.phone || '', college: u.college || '', level: u.level || '',
    topic: u.topic || '', title: u.title || '', tracks: JSON.parse(u.tracks || '["original"]'), activeTrack: u.active_track || 'original',
    mentorId: u.mentor_id || null, active: u.active !== 0, joined: u.joined
  };
}
function cookieOf(request) {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? m[1] : null;
}
/* The connector's tool calls run through the same routes as the portal, as the mentor who approved it. */
const actors = new WeakMap();
async function asUser(env, ctx, origin, user, method, path, data) {
  const req = new Request(origin + path, { method, headers: data ? { 'content-type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
  actors.set(req, user);
  let res;
  try { res = await route(req, env, new URL(req.url), ctx); } catch (e) {
    if (e instanceof HttpError) return { status: e.status, body: { error: e.message } };
    throw e;
  }
  return { status: res.status, body: await res.json() };
}
async function currentUser(request, env) {
  if (actors.has(request)) return actors.get(request);
  const token = cookieOf(request);
  if (!token) return null;
  const row = await env.DB.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires > ? AND u.active = 1')
    .bind(await sha256(token), now()).first();
  return row ? openUsers(env, row) : null;
}
async function requireUser(request, env) { const u = await currentUser(request, env); if (!u) throw new HttpError(401, 'Please log in again.'); return u; }
async function requireAdmin(request, env) { const u = await requireUser(request, env); if (u.role !== 'admin') throw new HttpError(403, 'Mentors only.'); return u; }
async function getMember(env, id) {
  const u = await env.DB.prepare("SELECT * FROM users WHERE id = ? AND role = 'member'").bind(id).first();
  if (!u) throw new HttpError(404, 'Member not found.');
  return openUsers(env, u);
}
function validTracks(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((t) => { if (TRACK_STEPS[t] && !out.includes(t)) out.push(t); });
  return out;
}

/* ---------- progress ---------- */
function toSub(r, reviewers) {
  const s = { id: r.id, userId: r.user_id, track: r.track, step: r.step, text: r.text, status: r.status, feedback: r.feedback || '', reviewerId: r.reviewer_id || null, createdAt: r.created_at, reviewedAt: r.reviewed_at || null };
  if (reviewers) s.reviewer = r.reviewer_id && reviewers[r.reviewer_id] ? { id: r.reviewer_id, name: reviewers[r.reviewer_id] } : null;
  return s;
}
async function adminNames(env) {
  const { results } = await env.DB.prepare("SELECT id, name FROM users WHERE role = 'admin'").all();
  const m = {}; results.forEach((r) => { m[r.id] = r.name; }); return m;
}
function computeStates(subs, track) {
  const out = []; let open = true;
  for (let n = 1; n <= (TRACK_STEPS[track] || 0); n++) {
    const latest = subs.filter((s) => s.track === track && s.step === n).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] || null;
    let st;
    if (latest && latest.status === 'approved') st = 'approved';
    else if (open) { st = latest ? latest.status : 'current'; open = false; }
    else st = 'locked';
    out.push({ step: n, status: st, submission: latest });
  }
  return out;
}
async function userSubs(env, userId, reviewers) {
  // reviewers may be a name map, `true` (look the names up in parallel) or empty
  const [res, names] = await Promise.all([
    env.DB.prepare('SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all(),
    reviewers === true ? adminNames(env) : reviewers
  ]);
  return res.results.map((r) => toSub(r, names));
}
function progressOf(u, subs) {
  const p = {};
  pub(u).tracks.forEach((t) => {
    const s = computeStates(subs, t);
    p[t] = { done: s.filter((x) => x.status === 'approved').length, total: s.length, current: s.find((x) => x.status !== 'approved') || null };
  });
  return p;
}
async function memberSummary(env, u, reviewers, allSubs) {
  const subs = allSubs ? allSubs.filter((s) => s.userId === u.id) : await userSubs(env, u.id, reviewers);
  const p = pub(u), prog = progressOf(u, subs);
  const a = prog[p.activeTrack] || { done: 0, total: TRACK_STEPS[p.activeTrack] || 0, current: null };
  return { ...p, progress: prog, done: a.done, total: a.total, current: a.current,
    mentor: p.mentorId && reviewers[p.mentorId] ? { id: p.mentorId, name: reviewers[p.mentorId] } : null,
    lastActive: subs[0] ? subs[0].createdAt : p.joined };
}
async function createMember(env, data, mentorId) {
  const name = str(data.name, 120), email = str(data.email, 200).toLowerCase();
  if (!name) throw bad('Enter the member’s name.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('Enter a valid email address.');
  if (await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()) throw bad('An account with this email already exists.');
  let tracks = validTracks(data.tracks); if (!tracks.length) tracks = ['original'];
  const password = data.password ? pw(data.password) : tempPassword();
  if (password.length < 8) throw bad('Use at least 8 characters for the password.');
  if (mentorId && !(await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'admin'").bind(mentorId).first())) mentorId = null;
  const { hash, salt } = await hashPassword(password);
  const id = randomId('u');
  await env.DB.prepare('INSERT INTO users (id, role, name, email, phone, pw_hash, pw_salt, college, level, tracks, active_track, mentor_id, joined) VALUES (?, \'member\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, name, email, await seal(env, str(data.phone, 40)), hash, salt, str(data.college, 200), str(data.level, 100), JSON.stringify(tracks), tracks[0], mentorId || null, now()).run();
  const u = await openUsers(env, await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first());
  return { user: pub(u), password };
}
async function setPassword(env, userId, password) {
  const { hash, salt } = await hashPassword(password);
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?').bind(hash, salt, userId),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId)
  ]);
  await revokeApps(env, userId);
}
function toApp(r) {
  return { id: r.id, name: r.name, email: r.email, phone: r.phone || '', college: r.college || '', level: r.level || '', experience: r.experience || '',
    goals: JSON.parse(r.goals || '[]'), why: r.why || '', createdAt: r.created_at, status: r.status, paid: !!r.paid, userId: r.user_id || null };
}

/* ---------- routes ---------- */
async function route(request, env, url, ctx) {
  const path = url.pathname.replace(/\/+$/, ''), method = request.method, DB = env.DB;
  let m;

  /* public */
  if (path === '/api/login' && method === 'POST') {
    const b = await body(request);
    const u = await DB.prepare('SELECT * FROM users WHERE email = ?').bind(str(b.email, 200).toLowerCase()).first();
    const ok = u && safeEqual((await hashPassword(pw(b.password), u.pw_salt)).hash, u.pw_hash);
    if (!ok) throw new HttpError(401, 'That email and password don’t match. Check them and try again.');
    if (u.active === 0) throw new HttpError(403, 'This account is paused. Contact your mentor.');
    await openUsers(env, u);
    const token = hex(crypto.getRandomValues(new Uint8Array(32)));
    const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
    await DB.batch([
      DB.prepare('DELETE FROM sessions WHERE expires < ?').bind(now()),
      DB.prepare('INSERT INTO sessions (token_hash, user_id, expires) VALUES (?, ?, ?)').bind(await sha256(token), u.id, expires.toISOString())
    ]);
    record(env, ctx, u.role + '.login', u.name + ' logged in', [['Name', u.name], ['Email', u.email]], u.role === 'member' ? 'member-' + u.id : '', u.id, u.role === 'member' ? u.id : null);
    return json(pub(u), 200, { 'set-cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}` });
  }
  if (path === '/api/logout' && method === 'POST') {
    const token = cookieOf(request);
    if (token) await DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
    return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }
  if (path === '/api/me' && method === 'GET') return json(pub(await currentUser(request, env)));
  if (path === '/api/applications' && method === 'POST') {
    const b = await body(request);
    const name = str(b.name, 120), email = str(b.email, 200);
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('Please enter your name and a valid email.');
    const goals = (Array.isArray(b.goals) ? b.goals : []).map((g) => str(g, 60)).filter((g) => GOALS[g]).slice(0, 8);
    const id = randomId('a');
    await DB.prepare('INSERT INTO applications (id, name, email, phone, college, level, experience, goals, why, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, name, email, await seal(env, str(b.phone, 40)), str(b.college, 200), str(b.level, 100), str(b.experience, 100), JSON.stringify(goals), await seal(env, str(b.why, 3000)), now()).run();
    record(env, ctx, 'application.new', 'New application from ' + name, [
      ['Application', id], ['Name', name], ['Email', email], ['WhatsApp', str(b.phone, 40)], ['College', str(b.college, 200)], ['Level', str(b.level, 100)],
      ['Experience', str(b.experience, 100)], ['Interested in', goals.join(', ')], ['Why', str(b.why, 3000)]
    ], 'applications');
    return json({ id }, 201);
  }

  /* signed in: own account */
  if (path === '/api/me/password' && method === 'POST') {
    const u = await requireUser(request, env), b = await body(request);
    if (!safeEqual((await hashPassword(pw(b.current), u.pw_salt)).hash, u.pw_hash)) throw bad('Your current password isn’t right.');
    const next = pw(b.next);
    if (next.length < 8) throw bad('Use at least 8 characters for the new password.');
    if (next === pw(b.current)) throw bad('Choose a password that’s different from the current one.');
    const { hash, salt } = await hashPassword(next);
    await DB.prepare('UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?').bind(hash, salt, u.id).run();
    await revokeApps(env, u.id);
    record(env, ctx, u.role + '.password', u.name + ' changed their password', [['Name', u.name], ['Email', u.email]], u.role === 'member' ? 'member-' + u.id : '', u.id, u.role === 'member' ? u.id : null);
    return json({ ok: true });
  }

  /* member */
  if (path === '/api/states' && method === 'GET') {
    const u = await requireUser(request, env), track = url.searchParams.get('track');
    if (!TRACK_STEPS[track]) throw bad('Unknown programme.');
    const target = u.role === 'admin' && url.searchParams.get('user') ? await getMember(env, url.searchParams.get('user')) : u;
    return json(computeStates(await userSubs(env, target.id, true), track));
  }
  if (path === '/api/progress' && method === 'GET') {
    const u = await requireUser(request, env);
    return json(progressOf(u, await userSubs(env, u.id)));
  }
  if (path === '/api/active-track' && method === 'POST') {
    const u = await requireUser(request, env), b = await body(request), t = str(b.track, 20);
    if (!TRACK_STEPS[t]) throw bad('That programme isn’t available.');
    const tracks = pub(u).tracks; if (!tracks.includes(t)) tracks.push(t);
    await DB.prepare('UPDATE users SET tracks = ?, active_track = ? WHERE id = ?').bind(JSON.stringify(tracks), t, u.id).run();
    if (u.role === 'member' && t !== u.active_track) record(env, ctx, 'member.programme', u.name + ' switched to ' + trackName(t), [['Member', u.name], ['Was on', trackName(u.active_track)], ['Now on', trackName(t)]], 'member-' + u.id, u.id, u.id);
    return json(pub(await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(u.id).first())));
  }
  if (path === '/api/submissions' && method === 'GET') {
    const u = await requireUser(request, env), who = url.searchParams.get('user');
    const id = u.role === 'admin' && who ? (await getMember(env, who)).id : u.id;
    return json(await userSubs(env, id, true));
  }
  if (path === '/api/submit' && method === 'POST') {
    const u = await requireUser(request, env), b = await body(request), track = str(b.track, 20), step = Number(b.step), text = str(b.text, 20000);
    if (!TRACK_STEPS[track]) throw bad('Unknown programme.');
    if (!text) throw bad('Write your answer before submitting.');
    const st = computeStates(await userSubs(env, u.id), track)[step - 1];
    if (!st || (st.status !== 'current' && st.status !== 'revision')) throw bad('This step can’t be submitted right now.');
    const id = randomId('s');
    await DB.prepare('INSERT INTO submissions (id, user_id, track, step, text, status, created_at) VALUES (?, ?, ?, ?, ?, \'review\', ?)').bind(id, u.id, track, step, text, now()).run();
    const again = st.status === 'revision';
    record(env, ctx, again ? 'submission.resubmitted' : 'submission.new', u.name + (again ? ' resubmitted ' : ' submitted ') + trackName(track) + ', Step ' + step, [
      ['Submission', id], ['Member', u.name], ['Programme', trackName(track)], ['Step', step], ['Words', text.split(/\s+/).filter(Boolean).length]
    ], 'review-' + id, u.id, u.id);
    return json({ id }, 201);
  }

  /* chat: members talk to their mentors */
  if (path === '/api/chat' && method === 'GET') {
    const u = await requireUser(request, env);
    if (u.role !== 'member') throw bad('Mentors open conversations from Messages.');
    const messages = await chatMessages(env, u.id, str(url.searchParams.get('after'), 40));
    await markRead(env, u.id, u.id);
    return json({ messages });
  }
  if (path === '/api/chat' && method === 'POST') {
    const u = await requireUser(request, env), b = await body(request);
    if (u.role !== 'member') throw bad('Mentors reply from Messages.');
    const msg = await sendMessage(env, ctx, u.id, u, b.body, b.context);
    record(env, ctx, 'chat.member', u.name + ' sent a message', [['Member', u.name], ['About', msg.context], ['Message', msg.body.length > 500 ? msg.body.slice(0, 500) + '…' : msg.body]], 'chat-' + u.id, u.id, u.id);
    return json(msg, 201);
  }
  if (path === '/api/chat/unread' && method === 'GET') {
    const u = await requireUser(request, env);
    return json({ unread: (await unreadFor(env, u)).total });
  }

  /* admin */
  if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Not found.');
  const admin = await requireAdmin(request, env);
  await Promise.all([ensureSchema(env), sealExisting(env)]);

  if (path === '/api/admin/stats' && method === 'GET') {
    const one = (sql, ...p) => DB.prepare(sql).bind(...p).first().then((r) => r.n);
    const [unread, pending, pendingMine, members, myMembers, applications, approvedWeek] = await Promise.all([
      unreadFor(env, admin),
      one("SELECT COUNT(*) n FROM submissions WHERE status = 'review'"),
      one("SELECT COUNT(*) n FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'review' AND u.mentor_id = ?", admin.id),
      one("SELECT COUNT(*) n FROM users WHERE role = 'member' AND active = 1"),
      one("SELECT COUNT(*) n FROM users WHERE role = 'member' AND mentor_id = ?", admin.id),
      one("SELECT COUNT(*) n FROM applications WHERE status = 'new'"),
      one("SELECT COUNT(*) n FROM submissions WHERE status = 'approved' AND reviewed_at > ?", daysAgo(7))
    ]);
    return json({ pending, pendingMine, members, myMembers, applications, approvedWeek, unreadChats: unread.total });
  }
  if (path === '/api/admin/activity' && method === 'GET') {
    await ensureSchema(env);
    const since = str(url.searchParams.get('since'), 40) || daysAgo(7);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit'), 10) || 50, 1), 200);
    const type = str(url.searchParams.get('type'), 40);
    const { results } = await DB.prepare("SELECT a.*, u.name AS actor_name FROM activity a LEFT JOIN users u ON u.id = a.actor_id WHERE a.created_at > ? AND (? = '' OR a.type LIKE ? || '%') ORDER BY a.created_at DESC LIMIT ?")
      .bind(since, type, type, limit).all();
    const events = await Promise.all(results.map(async (r) => {
      let detail = {}; try { detail = JSON.parse((await unseal(env, r.detail)) || '{}'); } catch {}
      return { id: r.id, type: r.type, summary: r.summary, at: r.created_at, by: r.actor_name || null, memberId: r.member_id || null,
        detail, link: r.link ? url.origin + '/portal.html#' + r.link : null };
    }));
    return json({ events, checkedAt: now() });
  }
  if (path === '/api/admin/connections' && method === 'GET') {
    await ensureSchema(env);
    const { results } = await DB.prepare("SELECT t.client_id, c.name, MIN(t.created_at) AS since, MAX(t.created_at) AS last FROM oauth_tokens t LEFT JOIN oauth_clients c ON c.client_id = t.client_id WHERE t.user_id = ? AND t.kind = 'refresh' AND t.expires > ? GROUP BY t.client_id, c.name ORDER BY last DESC")
      .bind(admin.id, now()).all();
    return json(results.map((r) => ({ clientId: r.client_id, name: r.name || 'Connected app', since: r.since, lastUsed: r.last })));
  }
  if ((m = path.match(/^\/api\/admin\/connection\/([\w-]+)$/)) && method === 'DELETE') {
    await revokeApps(env, admin.id, m[1]);
    record(env, ctx, 'admin.connector', admin.name + ' disconnected an app', [['App', m[1]]], '', admin.id);
    return json({ ok: true });
  }
  if (path === '/api/admin/chats' && method === 'GET') {
    await ensureSchema(env);
    const [{ results }, unread] = await Promise.all([
      DB.prepare('SELECT m.*, u.name AS m_name, u.college AS m_college, s.name AS s_name FROM messages m JOIN (SELECT member_id, MAX(created_at) AS mx FROM messages GROUP BY member_id) t ON t.member_id = m.member_id AND t.mx = m.created_at JOIN users u ON u.id = m.member_id LEFT JOIN users s ON s.id = m.sender_id ORDER BY m.created_at DESC').all(),
      unreadFor(env, admin)
    ]);
    return json(await Promise.all(results.map(async (r) => ({
      member: { id: r.member_id, name: r.m_name, college: r.m_college || '' },
      last: { body: (await unseal(env, r.body)).slice(0, 160), role: r.sender_role, senderName: r.s_name || '', at: r.created_at },
      unread: unread.by[r.member_id] || 0
    }))));
  }
  if (path === '/api/admin/chats/unread' && method === 'GET') return json({ unread: (await unreadFor(env, admin)).total });
  if ((m = path.match(/^\/api\/admin\/chat\/([\w-]+)$/))) {
    const u = await getMember(env, m[1]);
    if (method === 'GET') {
      const messages = await chatMessages(env, u.id, str(url.searchParams.get('after'), 40));
      await markRead(env, u.id, admin.id);
      return json({ member: pub(u), messages });
    }
    if (method === 'POST') {
      const b = await body(request);
      const msg = await sendMessage(env, ctx, u.id, admin, b.body, b.context);
      record(env, ctx, 'chat.mentor', admin.name + ' messaged ' + u.name, [['Member', u.name], ['Message', msg.body.length > 500 ? msg.body.slice(0, 500) + '…' : msg.body]], 'chat-' + u.id, admin.id, u.id);
      return json(msg, 201);
    }
  }
  if (path === '/api/admin/mentors' && method === 'GET') {
    const { results } = await DB.prepare("SELECT * FROM users WHERE role = 'admin' ORDER BY joined").all();
    return json((await openUsers(env, results)).map(pub));
  }
  if (path === '/api/admin/queue' && method === 'GET') {
    const { results } = await DB.prepare("SELECT s.*, u.name AS m_name, u.email AS m_email, u.phone AS m_phone, u.college AS m_college, u.mentor_id AS m_mentor FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'review' ORDER BY s.created_at ASC").all();
    await openRows(env, results, ['m_phone']);
    return json(results.map((r) => ({ ...toSub(r), member: { id: r.user_id, name: r.m_name, email: r.m_email, phone: r.m_phone || '', college: r.m_college || '', mentorId: r.m_mentor || null } })));
  }
  if ((m = path.match(/^\/api\/admin\/submission\/([\w-]+)$/)) && method === 'GET') {
    const r = await DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(m[1]).first();
    if (!r) return json(null);
    const u = await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(r.user_id).first());
    if (!u) return json(null);
    const names = await adminNames(env);
    const { results } = await DB.prepare('SELECT * FROM submissions WHERE user_id = ? AND track = ? AND step = ? AND id != ? ORDER BY created_at DESC').bind(r.user_id, r.track, r.step, r.id).all();
    return json({ ...toSub(r, names), member: pub(u), history: results.map((x) => toSub(x, names)) });
  }
  if ((m = path.match(/^\/api\/admin\/review\/([\w-]+)$/)) && method === 'POST') {
    const b = await body(request), decision = b.decision === 'approved' ? 'approved' : 'revision', feedback = str(b.feedback, 5000);
    const res = await DB.prepare("UPDATE submissions SET status = ?, feedback = ?, reviewer_id = ?, reviewed_at = ? WHERE id = ? AND status = 'review'").bind(decision, feedback, admin.id, now(), m[1]).run();
    if (!res.meta.changes) throw bad('This submission has already been reviewed.');
    const r = await DB.prepare('SELECT s.user_id, s.track, s.step, u.name FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.id = ?').bind(m[1]).first();
    if (r) record(env, ctx, 'review.' + decision, admin.name + (decision === 'approved' ? ' approved ' : ' requested changes on ') + r.name + '’s ' + trackName(r.track) + ', Step ' + r.step,
      [['Submission', m[1]], ['Member', r.name], ['Feedback', feedback]], 'review-' + m[1], admin.id, r.user_id);
    return json({ ok: true });
  }
  if (path === '/api/admin/members' && method === 'GET') {
    const [names, { results: users }, { results: subs }] = await Promise.all([
      adminNames(env),
      DB.prepare("SELECT * FROM users WHERE role = 'member'").all(),
      DB.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all()
    ]);
    await openUsers(env, users);
    const all = subs.map((r) => toSub(r));
    const out = await Promise.all(users.map((u) => memberSummary(env, u, names, all)));
    return json(out.sort((a, b) => (a.lastActive < b.lastActive ? 1 : -1)));
  }
  if (path === '/api/admin/members' && method === 'POST') {
    const b = await body(request);
    const res = await createMember(env, b, str(b.mentorId, 40) || admin.id);
    record(env, ctx, 'member.added', admin.name + ' added ' + res.user.name, [['Member', res.user.name], ['Email', res.user.email]], 'member-' + res.user.id, admin.id, res.user.id);
    return json(res, 201);
  }
  if ((m = path.match(/^\/api\/admin\/member\/([\w-]+)$/))) {
    const u = await getMember(env, m[1]);
    if (method === 'GET') {
      const names = await adminNames(env), subs = await userSubs(env, u.id, names);  // names reused below
      const states = {}; pub(u).tracks.forEach((t) => { states[t] = computeStates(subs, t); });
      return json({ ...(await memberSummary(env, u, names, subs)), states });
    }
    if (method === 'DELETE') {
      await DB.batch([
        DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM submissions WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM messages WHERE member_id = ?').bind(u.id),
        DB.prepare('DELETE FROM chat_reads WHERE member_id = ? OR reader_id = ?').bind(u.id, u.id),
        DB.prepare('UPDATE applications SET user_id = NULL WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM users WHERE id = ?').bind(u.id)
      ]);
      record(env, ctx, 'member.removed', admin.name + ' removed ' + u.name, [['Member', u.name], ['Email', u.email]], '', admin.id, u.id);
      return json({ ok: true });
    }
  }
  if ((m = path.match(/^\/api\/admin\/member\/([\w-]+)\/(reset-password|password|mentor|tracks|phone)$/)) && method === 'POST') {
    const u = await getMember(env, m[1]), b = await body(request);
    if (m[2] === 'reset-password' || m[2] === 'password') {
      const newPw = m[2] === 'password' ? pw(b.password) : tempPassword();
      if (newPw.length < 8) throw bad('Use at least 8 characters.');
      await setPassword(env, u.id, newPw);
      record(env, ctx, 'member.password', admin.name + (m[2] === 'password' ? ' set a new password for ' : ' reset the password for ') + u.name, [['Member', u.name]], 'member-' + u.id, admin.id, u.id);
      return json({ user: pub(u), password: newPw });
    }
    if (m[2] === 'mentor') {
      const mid = str(b.mentorId, 40) || null;
      if (mid && !(await DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'admin'").bind(mid).first())) throw bad('Mentor not found.');
      await DB.prepare('UPDATE users SET mentor_id = ? WHERE id = ?').bind(mid, u.id).run();
    }
    if (m[2] === 'tracks') {
      const t = validTracks(b.tracks); if (!t.length) throw bad('Keep at least one programme.');
      const active = t.includes(u.active_track) ? u.active_track : t[0];
      await DB.prepare('UPDATE users SET tracks = ?, active_track = ? WHERE id = ?').bind(JSON.stringify(t), active, u.id).run();
    }
    if (m[2] === 'phone') await DB.prepare('UPDATE users SET phone = ? WHERE id = ?').bind(await seal(env, str(b.phone, 40)), u.id).run();
    const what = { mentor: 'changed the mentor for ', tracks: 'changed the programmes for ', phone: 'updated the WhatsApp number for ' }[m[2]];
    record(env, ctx, 'member.' + m[2], admin.name + ' ' + what + u.name, [['Member', u.name], ['Mentor', m[2] === 'mentor' ? str(b.mentorId, 40) || 'none' : ''], ['Programmes', m[2] === 'tracks' ? validTracks(b.tracks).map(trackName).join(', ') : '']], 'member-' + u.id, admin.id, u.id);
    return json(pub(await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(u.id).first())));
  }
  if (path === '/api/admin/applications' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
    return json((await openRows(env, results, SEALED.applications)).map(toApp));
  }
  if ((m = path.match(/^\/api\/admin\/application\/([\w-]+)\/(paid|decline|approve)$/)) && method === 'POST') {
    const a = await openRows(env, await DB.prepare('SELECT * FROM applications WHERE id = ?').bind(m[1]).first(), SEALED.applications);
    if (!a) throw new HttpError(404, 'Application not found.');
    if (m[2] === 'paid') {
      const b = await body(request);
      await DB.prepare('UPDATE applications SET paid = ? WHERE id = ?').bind(b.paid ? 1 : 0, a.id).run();
      record(env, ctx, 'application.paid', admin.name + ' marked ' + a.name + (b.paid ? ' as paid' : ' as unpaid'), [['Application', a.id], ['Name', a.name]], 'applications', admin.id);
      return json({ ok: true });
    }
    if (a.status !== 'new') throw bad('This application has already been handled.');
    if (m[2] === 'decline') {
      await DB.prepare("UPDATE applications SET status = 'declined' WHERE id = ?").bind(a.id).run();
      record(env, ctx, 'application.declined', admin.name + ' declined ' + a.name + '’s application', [['Application', a.id], ['Name', a.name]], 'applications', admin.id);
      return json({ ok: true });
    }
    const tracks = JSON.parse(a.goals || '[]').map((g) => GOALS[g]).filter(Boolean);
    const res = await createMember(env, { name: a.name, email: a.email, phone: a.phone, college: a.college, level: a.level, tracks }, admin.id);
    await DB.prepare("UPDATE applications SET status = 'approved', user_id = ? WHERE id = ?").bind(res.user.id, a.id).run();
    record(env, ctx, 'application.approved', admin.name + ' approved ' + a.name + ' and created their login', [['Application', a.id], ['Member', a.name], ['Email', a.email]], 'member-' + res.user.id, admin.id, res.user.id);
    return json(res);
  }
  throw new HttpError(404, 'Not found.');
}

/* what connector.js needs from this file */
const CONNECTOR_API = { asUser, ensureSchema, record, hashPassword, safeEqual, sha256, hex, randomId, now, currentUser, openUsers, pub, trackName, TRACK_STEPS, TRACK_NAMES };
