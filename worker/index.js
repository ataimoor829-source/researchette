/* Researchette API (Cloudflare Worker + D1).
   Serves /api/* and hands every other request to the static site in ./public.
   Passwords are hashed with PBKDF2-SHA256; sessions are random tokens in an HttpOnly cookie,
   stored only as a SHA-256 hash. Phone numbers and application answers are encrypted in the
   database with AES-256-GCM, using the DATA_KEY secret set in Cloudflare (never in this code).
   /mcp, /oauth/* and /.well-known/oauth-* are the MCP connector (see connector.js). */
import { connector } from './connector.js';
import { newSecret, checkTotp } from './totp.js';

// Number of steps in each programme. Keep in sync with public/assets/curriculum.js.
const TRACK_STEPS = { original: 10, case: 6, letter: 4, synopsis: 6, thesis: 6, meta: 7 };
const GOALS = { 'Original article': 'original', 'Synopsis': 'synopsis', 'Thesis': 'thesis', 'Meta-analysis': 'meta', 'Systematic review / meta-analysis': 'meta', 'Case report': 'case', 'Letter to the editor': 'letter' };
const TRACK_NAMES = { original: 'Original article', case: 'Case report', letter: 'Letter to the editor', synopsis: 'Synopsis', thesis: 'Thesis', meta: 'Systematic review & meta-analysis' };
const COOKIE = 'rt_s';
const DEVICE_COOKIE = 'rt_d';     // marks a device that passed two-step verification
const DEVICE_DAYS = 30;
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
function base36(n) {
  const a = 'abcdefghijkmnpqrstuvwxyz23456789', r = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(r, (x) => a[x % a.length]).join('');
}
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
  'CREATE TABLE IF NOT EXISTS chat_reads (member_id TEXT NOT NULL, reader_id TEXT NOT NULL, last_read TEXT NOT NULL, PRIMARY KEY (member_id, reader_id))',
  "CREATE TABLE IF NOT EXISTS user_perms (user_id TEXT PRIMARY KEY, owner INTEGER DEFAULT 0, perms TEXT DEFAULT '{}')",
  "CREATE TABLE IF NOT EXISTS two_factor (user_id TEXT PRIMARY KEY, secret TEXT NOT NULL, enabled INTEGER DEFAULT 0, last_step INTEGER DEFAULT 0, recovery TEXT DEFAULT '[]', created_at TEXT NOT NULL)",
  'CREATE TABLE IF NOT EXISTS trusted_devices (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL, expires TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS trusted_devices_user ON trusted_devices (user_id)',
  'CREATE TABLE IF NOT EXISTS login_tickets (ticket_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, purpose TEXT NOT NULL, attempts INTEGER DEFAULT 0, expires TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS user_prefs (user_id TEXT PRIMARY KEY, welcomed_at TEXT)',
  'CREATE TABLE IF NOT EXISTS classes (id TEXT PRIMARY KEY, name TEXT NOT NULL, mentor_id TEXT, created_by TEXT, created_at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS class_members (class_id TEXT NOT NULL, user_id TEXT NOT NULL, added_at TEXT NOT NULL, PRIMARY KEY (class_id, user_id))',
  'CREATE INDEX IF NOT EXISTS class_members_user ON class_members (user_id)',
  'CREATE TABLE IF NOT EXISTS class_messages (id TEXT PRIMARY KEY, class_id TEXT NOT NULL, sender_id TEXT NOT NULL, sender_role TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS class_messages_class ON class_messages (class_id, created_at)',
  'CREATE TABLE IF NOT EXISTS class_reads (class_id TEXT NOT NULL, reader_id TEXT NOT NULL, last_read TEXT NOT NULL, PRIMARY KEY (class_id, reader_id))',
  'CREATE TABLE IF NOT EXISTS lesson_edits (key TEXT PRIMARY KEY, data TEXT NOT NULL, updated_by TEXT, updated_at TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS step_unlocks (user_id TEXT NOT NULL, track TEXT NOT NULL, step INTEGER NOT NULL, unlocked_by TEXT, created_at TEXT NOT NULL, PRIMARY KEY (user_id, track, step))',
  "CREATE TABLE IF NOT EXISTS research (id TEXT PRIMARY KEY, student TEXT NOT NULL, title TEXT NOT NULL, journal TEXT NOT NULL, year INTEGER, kind TEXT DEFAULT '', link TEXT DEFAULT '', created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"
];
let schemaReady = null;
function ensureSchema(env) {
  if (!schemaReady) schemaReady = env.DB.batch(EXTRA_SCHEMA.map((q) => env.DB.prepare(q))).then(() => seedOwners(env)).catch((e) => { schemaReady = null; throw e; });
  return schemaReady;
}
// Zain and Taimoor are the owners. If neither account exists, the longest-standing mentor is, so there's always one.
const FIRST_OWNERS = ['uzain', 'utaimoor'];
async function seedOwners(env) {
  if (await env.DB.prepare('SELECT user_id FROM user_perms WHERE owner = 1 LIMIT 1').first()) return;
  const ph = FIRST_OWNERS.map(() => '?').join(', ');
  let { results } = await env.DB.prepare(`SELECT id FROM users WHERE role = 'admin' AND id IN (${ph})`).bind(...FIRST_OWNERS).all();
  if (!results.length) ({ results } = await env.DB.prepare("SELECT id FROM users WHERE role = 'admin' ORDER BY joined LIMIT 1").all());
  if (results.length) await env.DB.batch(results.map((r) => env.DB.prepare('INSERT INTO user_perms (user_id, owner) VALUES (?, 1) ON CONFLICT (user_id) DO UPDATE SET owner = 1').bind(r.id)));
}

/* ---------- owners and permissions ----------
   Owners (Zain and Taimoor) can do and see everything, and manage the team. Other mentors only see
   the members assigned to them, plus whatever the owners switch on below. Members' abilities can be
   switched off one by one too. */
const PERMS = {
  admin: { review: true, chat: true, edit_members: true, see_all: false, applications: false, add_members: false, passwords: false, view_lessons: false, edit_lessons: false },
  member: { chat: true, choose_programme: false }  // mentors choose the programmes; members ask for more in the chat
};
async function withAccess(env, u) {
  if (!u) return u;
  await ensureSchema(env);
  const row = await env.DB.prepare('SELECT owner, perms FROM user_perms WHERE user_id = ?').bind(u.id).first();
  let saved = {}; try { saved = JSON.parse((row && row.perms) || '{}'); } catch {}
  const base = PERMS[u.role] || {};
  u.owner = u.role === 'admin' && !!(row && row.owner);
  u.perms = {};
  Object.keys(base).forEach((k) => { u.perms[k] = typeof saved[k] === 'boolean' ? saved[k] : base[k]; });
  return u;
}
function cleanPerms(role, input) {
  const out = {}, base = PERMS[role] || {};
  Object.keys(base).forEach((k) => { if (input && typeof input[k] === 'boolean') out[k] = input[k]; });
  return out;
}
async function savePerms(env, userId, role, perms, owner) {
  const row = await env.DB.prepare('SELECT owner, perms FROM user_perms WHERE user_id = ?').bind(userId).first();
  let cur = {}; try { cur = JSON.parse((row && row.perms) || '{}'); } catch {}
  const next = { ...cur, ...cleanPerms(role, perms) };
  const own = owner === undefined ? (row ? row.owner : 0) : (owner ? 1 : 0);
  await env.DB.prepare('INSERT INTO user_perms (user_id, owner, perms) VALUES (?, ?, ?) ON CONFLICT (user_id) DO UPDATE SET owner = excluded.owner, perms = excluded.perms')
    .bind(userId, own, JSON.stringify(next)).run();
}
const can = (u, p) => !!u && ((u.role === 'admin' && u.owner) || !!(u.perms && u.perms[p]));
function needPerm(u, p) { if (!can(u, p)) throw new HttpError(403, 'You don’t have permission for this. Ask Zain or Taimoor to switch it on.'); }
function needOwner(u) { if (!(u && u.role === 'admin' && u.owner)) throw new HttpError(403, 'Only Zain and Taimoor can do this.'); }
const seesAll = (a) => a.owner || can(a, 'see_all');
// SQL condition limiting members (table alias u) to the ones this mentor may see
const scopeOf = (a) => (seesAll(a) ? { sql: '1 = 1', args: [] } : { sql: 'u.mentor_id = ?', args: [a.id] });

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
// A member's messages count as unread for their assigned mentor; unassigned members' go to the owners.
async function unreadFor(env, reader) {
  await ensureSchema(env);
  const admin = reader.role === 'admin';
  const scope = admin ? ' AND (u.mentor_id = ? OR (? = 1 AND u.mentor_id IS NULL))' : ' AND m.member_id = ?';
  const { results } = await env.DB.prepare('SELECT m.member_id, COUNT(*) AS n FROM messages m JOIN users u ON u.id = m.member_id LEFT JOIN chat_reads r ON r.member_id = m.member_id AND r.reader_id = ? WHERE m.sender_role = ? AND m.created_at > COALESCE(r.last_read, \'\')' + scope + ' GROUP BY m.member_id')
    .bind(...(admin ? [reader.id, 'member', reader.id, reader.owner ? 1 : 0] : [reader.id, 'admin', reader.id])).all();
  const by = {}; let total = 0;
  results.forEach((r) => { by[r.member_id] = r.n; total += r.n; });
  return { total, by };
}

/* ---------- classes ----------
   A class is a group of members under one mentor, with one group chat. Owners create and edit classes;
   the class's mentor (and every owner) can read and post; members read and post in classes they belong to. */
async function classRow(env, id) {
  const c = await env.DB.prepare('SELECT c.*, u.name AS mentor_name FROM classes c LEFT JOIN users u ON u.id = c.mentor_id WHERE c.id = ?').bind(id).first();
  if (!c) throw new HttpError(404, 'Class not found.');
  return c;
}
async function classFor(env, user, id) {
  await ensureSchema(env);
  const c = await classRow(env, id);
  if (user.role === 'admin') { if (!(user.owner || c.mentor_id === user.id)) throw new HttpError(403, 'This class belongs to another mentor.'); }
  else if (!(await env.DB.prepare('SELECT 1 FROM class_members WHERE class_id = ? AND user_id = ?').bind(id, user.id).first())) throw new HttpError(404, 'Class not found.');
  return c;
}
async function classMembers(env, id) {
  const { results } = await env.DB.prepare("SELECT u.id, u.name, u.college FROM class_members cm JOIN users u ON u.id = cm.user_id WHERE cm.class_id = ? AND u.role = 'member' ORDER BY u.name").bind(id).all();
  return results.map((r) => ({ id: r.id, name: r.name, college: r.college || '' }));
}
async function classInfo(env, c, reader) {
  const [members, last, unread] = await Promise.all([
    classMembers(env, c.id),
    env.DB.prepare('SELECT m.*, u.name AS sender_name FROM class_messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.class_id = ? ORDER BY m.created_at DESC LIMIT 1').bind(c.id).first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM class_messages m LEFT JOIN class_reads r ON r.class_id = m.class_id AND r.reader_id = ? WHERE m.class_id = ? AND m.sender_id != ? AND m.created_at > COALESCE(r.last_read, \'\')').bind(reader.id, c.id, reader.id).first()
  ]);
  return {
    id: c.id, name: c.name, mentor: c.mentor_id ? { id: c.mentor_id, name: c.mentor_name || '' } : null, createdAt: c.created_at, members,
    last: last ? { body: (await unseal(env, last.body)).slice(0, 160), senderName: last.sender_name || '', role: last.sender_role, at: last.created_at } : null,
    unread: unread ? unread.n : 0
  };
}
async function classesOf(env, user) {
  await ensureSchema(env);
  const q = user.role === 'admin'
    ? (user.owner ? env.DB.prepare('SELECT c.*, u.name AS mentor_name FROM classes c LEFT JOIN users u ON u.id = c.mentor_id ORDER BY c.created_at DESC')
      : env.DB.prepare('SELECT c.*, u.name AS mentor_name FROM classes c LEFT JOIN users u ON u.id = c.mentor_id WHERE c.mentor_id = ? ORDER BY c.created_at DESC').bind(user.id))
    : env.DB.prepare('SELECT c.*, u.name AS mentor_name FROM classes c JOIN class_members cm ON cm.class_id = c.id LEFT JOIN users u ON u.id = c.mentor_id WHERE cm.user_id = ? ORDER BY c.created_at DESC').bind(user.id);
  const { results } = await q.all();
  const list = await Promise.all(results.map((c) => classInfo(env, c, user)));
  return list.sort((a, b) => ((b.last && b.last.at) || b.createdAt).localeCompare((a.last && a.last.at) || a.createdAt));
}
async function classUnread(env, user) {
  await ensureSchema(env);
  const scope = user.role === 'admin' ? (user.owner ? '' : ' AND c.mentor_id = ?') : ' AND c.id IN (SELECT class_id FROM class_members WHERE user_id = ?)';
  const args = user.role === 'admin' ? (user.owner ? [] : [user.id]) : [user.id];
  const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM class_messages m JOIN classes c ON c.id = m.class_id LEFT JOIN class_reads r ON r.class_id = m.class_id AND r.reader_id = ? WHERE m.sender_id != ? AND m.created_at > COALESCE(r.last_read, \'\')' + scope)
    .bind(user.id, user.id, ...args).first();
  return r ? r.n : 0;
}
async function classMessages(env, classId, readerId, after) {
  const { results } = await env.DB.prepare('SELECT m.*, u.name AS sender_name FROM class_messages m LEFT JOIN users u ON u.id = m.sender_id WHERE m.class_id = ? AND m.created_at > ? ORDER BY m.created_at ASC LIMIT 500').bind(classId, after || '').all();
  await env.DB.prepare('INSERT INTO class_reads (class_id, reader_id, last_read) VALUES (?, ?, ?) ON CONFLICT (class_id, reader_id) DO UPDATE SET last_read = excluded.last_read').bind(classId, readerId, now()).run();
  return Promise.all(results.map(async (r) => ({ id: r.id, senderId: r.sender_id, senderName: r.sender_name || (r.sender_role === 'admin' ? 'Mentor' : 'Member'), role: r.sender_role, body: await unseal(env, r.body), context: '', at: r.created_at })));
}
async function sendClassMessage(env, classId, sender, text) {
  const bodyText = str(text, 4000);
  if (!bodyText) throw bad('Write a message first.');
  const id = randomId('g'), at = now();
  await env.DB.batch([
    env.DB.prepare('INSERT INTO class_messages (id, class_id, sender_id, sender_role, body, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, classId, sender.id, sender.role, await seal(env, bodyText), at),
    env.DB.prepare('INSERT INTO class_reads (class_id, reader_id, last_read) VALUES (?, ?, ?) ON CONFLICT (class_id, reader_id) DO UPDATE SET last_read = excluded.last_read').bind(classId, sender.id, at)
  ]);
  return { id, senderId: sender.id, senderName: sender.name, role: sender.role, body: bodyText, context: '', at };
}
async function saveClassMembers(env, classId, ids) {
  const clean = [...new Set((Array.isArray(ids) ? ids : []).map((x) => str(x, 40)).filter(Boolean))].slice(0, 300);
  const ok = clean.length ? (await env.DB.prepare("SELECT id FROM users WHERE role = 'member' AND id IN (" + clean.map(() => '?').join(',') + ')').bind(...clean).all()).results.map((r) => r.id) : [];
  const t = now();
  await env.DB.batch([env.DB.prepare('DELETE FROM class_members WHERE class_id = ?').bind(classId),
    ...ok.map((id) => env.DB.prepare('INSERT INTO class_members (class_id, user_id, added_at) VALUES (?, ?, ?)').bind(classId, id, t))]);
  return ok;
}
async function classMentor(env, id) {
  if (!id) return null;
  const m = await env.DB.prepare("SELECT id, name FROM users WHERE id = ? AND role = 'admin'").bind(str(id, 40)).first();
  if (!m) throw bad('Pick a mentor from the list.');
  return m;
}

/* ---------- users & sessions ---------- */
function pub(u) {
  if (!u) return null;
  return {
    id: u.id, role: u.role, name: u.name, email: u.email, phone: u.phone || '', college: u.college || '', level: u.level || '',
    topic: u.topic || '', title: u.title || '', tracks: JSON.parse(u.tracks || '["original"]'), activeTrack: u.active_track || 'original',
    mentorId: u.mentor_id || null, active: u.active !== 0, joined: u.joined,
    ...(u.perms ? { owner: !!u.owner, perms: u.perms } : {}),
    ...(u.welcome ? { welcome: true } : {})
  };
}
// the portal shows a welcome tour the first time someone opens it (on any device)
async function withWelcome(env, u) {
  if (!u) return u;
  await ensureSchema(env);
  const row = await env.DB.prepare('SELECT welcomed_at FROM user_prefs WHERE user_id = ?').bind(u.id).first();
  u.welcome = !(row && row.welcomed_at);
  return u;
}
function cookieOf(request, name = COOKIE) {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

/* ---------- two-step verification (owners) ----------
   Owners enter a 6-digit code from Apple Passwords (or any authenticator app) when they log in on a
   device that hasn't passed the check in the last 30 days. The first time, they set it up by scanning
   a QR code, and get recovery codes in case they lose their phone. */
const needsTwoStep = (u) => u.role === 'admin' && !!u.owner;
async function deviceTrusted(env, request, userId) {
  const t = cookieOf(request, DEVICE_COOKIE);
  if (!t) return false;
  await ensureSchema(env);
  return !!(await env.DB.prepare('SELECT 1 FROM trusted_devices WHERE token_hash = ? AND user_id = ? AND expires > ?').bind(await sha256(t), userId, now()).first());
}
async function twoStepOf(env, userId) {
  await ensureSchema(env);
  return env.DB.prepare('SELECT * FROM two_factor WHERE user_id = ?').bind(userId).first();
}
// checks a 6-digit code (or an unused recovery code) and records it so it can't be used again
async function checkSecondFactor(env, userId, code) {
  const tf = await twoStepOf(env, userId);
  if (!tf) return false;
  const secret = await unseal(env, tf.secret);
  const step = await checkTotp(secret, code, tf.last_step);
  if (step) { await env.DB.prepare('UPDATE two_factor SET last_step = ? WHERE user_id = ?').bind(step, userId).run(); return 'code'; }
  const rc = String(code || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (tf.enabled && rc.length === 10) {
    const list = JSON.parse(tf.recovery || '[]'), h = await sha256(rc), i = list.indexOf(h);
    if (i > -1) { list.splice(i, 1); await env.DB.prepare('UPDATE two_factor SET recovery = ? WHERE user_id = ?').bind(JSON.stringify(list), userId).run(); return 'recovery'; }
  }
  return false;
}
async function trustDevice(env, userId) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32))), expires = new Date(Date.now() + DEVICE_DAYS * 864e5);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM trusted_devices WHERE expires < ?').bind(now()),
    env.DB.prepare('INSERT INTO trusted_devices (token_hash, user_id, created_at, expires) VALUES (?, ?, ?, ?)').bind(await sha256(token), userId, now(), expires.toISOString())
  ]);
  return `${DEVICE_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`;
}
async function forgetDevices(env, userId) { await ensureSchema(env); await env.DB.prepare('DELETE FROM trusted_devices WHERE user_id = ?').bind(userId).run(); }
async function startSession(env, ctx, u, extraCookies = []) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires < ?').bind(now()),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires) VALUES (?, ?, ?)').bind(await sha256(token), u.id, expires.toISOString())
  ]);
  record(env, ctx, u.role + '.login', u.name + ' logged in', [['Name', u.name], ['Email', u.email]], u.role === 'member' ? 'member-' + u.id : '', u.id, u.role === 'member' ? u.id : null);
  return [`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`, ...extraCookies];
}
function withCookies(res, cookies) { cookies.forEach((c) => res.headers.append('set-cookie', c)); return res; }
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
  if (actors.has(request)) return withAccess(env, actors.get(request));
  const token = cookieOf(request);
  if (!token) return null;
  const row = await env.DB.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires > ? AND u.active = 1')
    .bind(await sha256(token), now()).first();
  return row ? withAccess(env, await openUsers(env, row)) : null;
}
async function requireUser(request, env) { const u = await currentUser(request, env); if (!u) throw new HttpError(401, 'Please log in again.'); return u; }
async function requireAdmin(request, env) { const u = await requireUser(request, env); if (u.role !== 'admin') throw new HttpError(403, 'Mentors only.'); return u; }
async function getMember(env, id) {
  const u = await env.DB.prepare("SELECT * FROM users WHERE id = ? AND role = 'member'").bind(id).first();
  if (!u) throw new HttpError(404, 'Member not found.');
  return openUsers(env, u);
}
// a member this mentor is allowed to see (their own students, or anyone for owners and see_all)
async function memberFor(env, admin, id) {
  const u = await getMember(env, id);
  if (!seesAll(admin) && u.mentor_id !== admin.id) throw new HttpError(404, 'Member not found.');
  return u;
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
// A step is open once the step before it is approved, or when a mentor has unlocked it (step_unlocks).
// Unlocks travel with the submissions list (subs.unlocks, loaded by userSubs).
function computeStates(subs, track) {
  const out = [], un = (subs.unlocks && subs.unlocks[track]) || null;
  for (let n = 1; n <= (TRACK_STEPS[track] || 0); n++) {
    const latest = subs.filter((s) => s.track === track && s.step === n).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] || null;
    const unlocked = !!(un && un.has(n)), open = n === 1 || out[n - 2].status === 'approved' || unlocked;
    const st = latest ? latest.status : open ? 'current' : 'locked';
    out.push({ step: n, status: st, submission: latest, unlocked });
  }
  return out;
}
async function userSubs(env, userId, reviewers) {
  // reviewers may be a name map, `true` (look the names up in parallel) or empty
  await ensureSchema(env);
  const [res, names, un] = await Promise.all([
    env.DB.prepare('SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all(),
    reviewers === true ? adminNames(env) : reviewers,
    env.DB.prepare('SELECT track, step FROM step_unlocks WHERE user_id = ?').bind(userId).all()
  ]);
  const list = res.results.map((r) => toSub(r, names));
  list.unlocks = {};
  un.results.forEach((r) => { (list.unlocks[r.track] = list.unlocks[r.track] || new Set()).add(r.step); });
  return list;
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
async function createMentor(env, data) {
  const name = str(data.name, 120), email = str(data.email, 200).toLowerCase();
  if (!name) throw bad('Enter the mentor’s name.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('Enter a valid email address.');
  if (await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()) throw bad('An account with this email already exists.');
  const password = data.password ? pw(data.password) : tempPassword();
  if (password.length < 8) throw bad('Use at least 8 characters for the password.');
  const { hash, salt } = await hashPassword(password);
  const id = randomId('u');
  await env.DB.prepare("INSERT INTO users (id, role, name, email, phone, pw_hash, pw_salt, title, joined) VALUES (?, 'admin', ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, name, email, await seal(env, str(data.phone, 40)), hash, salt, str(data.title, 100) || 'Mentor', now()).run();
  await savePerms(env, id, 'admin', data.perms || {}, !!data.owner);
  const u = await withAccess(env, await openUsers(env, await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()));
  return { user: pub(u), password };
}
async function setPassword(env, userId, password) {
  const { hash, salt } = await hashPassword(password);
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?').bind(hash, salt, userId),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId)
  ]);
  await Promise.all([revokeApps(env, userId), forgetDevices(env, userId)]);
}
function toApp(r) {
  return { id: r.id, name: r.name, email: r.email, phone: r.phone || '', college: r.college || '', level: r.level || '', experience: r.experience || '',
    goals: JSON.parse(r.goals || '[]'), why: r.why || '', createdAt: r.created_at, status: r.status, paid: !!r.paid, userId: r.user_id || null };
}

/* ---------- lesson edits ----------
   Owners can proofread and reword any step. Only these text fields can change; the charts and the
   step order stay as they are in public/assets/curriculum.js. Edits are layered on top of that file. */
function cleanLesson(d) {
  d = d || {};
  const out = {}, list = (v, n, max) => (Array.isArray(v) ? v : []).map((x) => str(x, max)).filter(Boolean).slice(0, n);
  if (typeof d.title === 'string' && str(d.title, 120)) out.title = str(d.title, 120);
  if (typeof d.summary === 'string') out.summary = str(d.summary, 200);
  if (d.minutes != null && +d.minutes >= 1) out.minutes = Math.min(240, Math.round(+d.minutes));
  if (typeof d.intro === 'string') out.intro = str(d.intro, 2000);
  if (Array.isArray(d.lesson)) out.lesson = d.lesson.map((l) => ({ h: str(l && l.h, 150), p: str(l && l.p, 2000) })).filter((l) => l.h || l.p).slice(0, 12);
  if (d.example && typeof d.example === 'object') out.example = { weak: str(d.example.weak, 3000), strong: str(d.example.strong, 3000), why: str(d.example.why, 3000) };
  if (Array.isArray(d.mistakes)) out.mistakes = list(d.mistakes, 12, 300);
  if (Array.isArray(d.include)) out.include = list(d.include, 12, 300);
  if (typeof d.template === 'string') out.template = str(d.template, 4000);
  if (d.task && typeof d.task === 'object' && typeof d.task.prompt === 'string') out.task = { prompt: str(d.task.prompt, 3000) };
  return out;
}

/* ---------- published research ----------
   Papers our students published with us, shown on research.html. Owners add and remove them. */
const RESEARCH_KINDS = ['Original article', 'Systematic review', 'Meta-analysis', 'Case report', 'Letter to the editor', 'Narrative review', 'Thesis', 'Conference abstract', 'Other'];
function cleanResearch(b) {
  const out = { student: str(b.student, 120), title: str(b.title, 400), journal: str(b.journal, 200), kind: RESEARCH_KINDS.includes(b.kind) ? b.kind : '' };
  if (!out.student) throw bad('Enter the student’s name.');
  if (!out.title) throw bad('Enter the paper’s title.');
  if (!out.journal) throw bad('Enter the journal.');
  const y = str(b.year, 4);
  out.year = y ? Math.round(+y) : null;
  if (y && !(out.year >= 1950 && out.year <= new Date().getFullYear() + 1)) throw bad('Enter the year it was published, like 2026.');
  let link = str(b.link, 500);
  if (/^10\.\d{4,}\//.test(link)) link = 'https://doi.org/' + link; // a bare DOI
  else if (/^doi:\s*/i.test(link)) link = 'https://doi.org/' + link.replace(/^doi:\s*/i, '');
  else if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
  if (link) { try { const u = new URL(link); if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) throw 0; link = u.href; } catch { throw bad('That link doesn’t look right. Paste the DOI or the paper’s web address.'); } }
  out.link = link;
  return out;
}
function pubResearch(r) { return { id: r.id, student: r.student, title: r.title, journal: r.journal, year: r.year || null, kind: r.kind || '', link: r.link || '', createdAt: r.created_at }; }
async function listResearch(env) {
  await ensureSchema(env);
  const { results } = await env.DB.prepare('SELECT * FROM research ORDER BY COALESCE(year, 0) DESC, created_at DESC').all();
  return results.map(pubResearch);
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
    await withAccess(env, await openUsers(env, u));
    if (needsTwoStep(u) && !(await deviceTrusted(env, request, u.id))) {
      // password was right; now the code (or, the first time, setting up the authenticator)
      let tf = await twoStepOf(env, u.id);
      const purpose = tf && tf.enabled ? 'verify' : 'setup';
      let secret = null;
      if (purpose === 'setup') {
        // reuse the key from an unfinished setup, so a code already scanned into Passwords keeps working
        secret = (tf && (await unseal(env, tf.secret))) || newSecret();
        await DB.prepare('INSERT INTO two_factor (user_id, secret, enabled, last_step, recovery, created_at) VALUES (?, ?, 0, 0, \'[]\', ?) ON CONFLICT (user_id) DO UPDATE SET secret = excluded.secret, enabled = 0, last_step = 0')
          .bind(u.id, await seal(env, secret), now()).run();
      }
      const ticket = hex(crypto.getRandomValues(new Uint8Array(32)));
      await DB.batch([
        DB.prepare('DELETE FROM login_tickets WHERE expires < ?').bind(now()),
        DB.prepare('INSERT INTO login_tickets (ticket_hash, user_id, purpose, attempts, expires) VALUES (?, ?, ?, 0, ?)').bind(await sha256(ticket), u.id, purpose, new Date(Date.now() + 10 * 60e3).toISOString())
      ]);
      const out = { twoFactor: purpose, ticket, name: u.name, email: u.email };
      if (secret) {
        out.secret = secret.replace(/(.{4})/g, '$1 ').trim();
        out.otpauth = 'otpauth://totp/' + encodeURIComponent('Researchette:' + u.email) + '?secret=' + secret + '&issuer=Researchette&algorithm=SHA1&digits=6&period=30';
      }
      return json(out);
    }
    return withCookies(json(pub(await withWelcome(env, u))), await startSession(env, ctx, u));
  }
  if (path === '/api/login/verify' && method === 'POST') {
    const b = await body(request);
    await ensureSchema(env);
    const th = await sha256(str(b.ticket, 100));
    const t = await DB.prepare('SELECT * FROM login_tickets WHERE ticket_hash = ?').bind(th).first();
    if (!t || t.expires < now() || t.attempts >= 5) {
      if (t) await DB.prepare('DELETE FROM login_tickets WHERE ticket_hash = ?').bind(th).run();
      throw new HttpError(401, 'This sign-in has expired. Enter your email and password again.');
    }
    await DB.prepare('UPDATE login_tickets SET attempts = attempts + 1 WHERE ticket_hash = ?').bind(th).run();
    const how = await checkSecondFactor(env, t.user_id, b.code);
    if (!how || (t.purpose === 'setup' && how !== 'code')) throw new HttpError(401, 'That code isn’t right. Check the code in your authenticator and try again.');
    await DB.prepare('DELETE FROM login_tickets WHERE ticket_hash = ?').bind(th).run();
    const u = await withAccess(env, await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ? AND active = 1').bind(t.user_id).first()));
    if (!u) throw new HttpError(403, 'This account is paused.');
    const out = pub(await withWelcome(env, u));
    if (t.purpose === 'setup') {
      // switch it on and hand out recovery codes, shown once
      const codes = Array.from({ length: 8 }, () => base36(10));
      await DB.prepare('UPDATE two_factor SET enabled = 1, recovery = ? WHERE user_id = ?').bind(JSON.stringify(await Promise.all(codes.map((c) => sha256(c)))), u.id).run();
      out.recoveryCodes = codes.map((c) => c.slice(0, 5) + '-' + c.slice(5));
      record(env, ctx, 'admin.two_step', u.name + ' set up two-step verification', [['Name', u.name]], '', u.id);
    }
    if (how === 'recovery') {
      out.recoveryUsed = true;
      out.recoveryLeft = JSON.parse((await twoStepOf(env, u.id)).recovery || '[]').length;
      record(env, ctx, 'admin.two_step', u.name + ' logged in with a recovery code', [['Name', u.name], ['Codes left', out.recoveryLeft]], '', u.id);
    }
    return withCookies(json(out), await startSession(env, ctx, u, [await trustDevice(env, u.id)]));
  }
  if (path === '/api/logout' && method === 'POST') {
    const token = cookieOf(request);
    if (token) await DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
    return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }
  if (path === '/api/me' && method === 'GET') {
    const u = pub(await withWelcome(env, await currentUser(request, env)));
    // members see who to ask (for example to unlock another programme)
    if (u && u.role === 'member' && u.mentorId) { const r = await DB.prepare('SELECT name FROM users WHERE id = ?').bind(u.mentorId).first(); if (r) u.mentorName = r.name; }
    return json(u);
  }
  if (path === '/api/me/welcomed' && method === 'POST') {
    const u = await requireUser(request, env);
    await ensureSchema(env);
    await DB.prepare('INSERT INTO user_prefs (user_id, welcomed_at) VALUES (?, ?) ON CONFLICT (user_id) DO UPDATE SET welcomed_at = excluded.welcomed_at').bind(u.id, now()).run();
    return json({ ok: true });
  }
  if (path === '/api/applications' && method === 'POST') {
    const b = await body(request);
    const name = str(b.name, 120), email = str(b.email, 200);
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('Please enter your name and a valid email.');
    const digits = str(b.phone, 40).replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) throw bad('Please enter your full WhatsApp number, like 0339 5888444.');
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
    await Promise.all([revokeApps(env, u.id), forgetDevices(env, u.id)]);
    record(env, ctx, u.role + '.password', u.name + ' changed their password', [['Name', u.name], ['Email', u.email]], u.role === 'member' ? 'member-' + u.id : '', u.id, u.role === 'member' ? u.id : null);
    return json({ ok: true });
  }

  /* member */
  if (path === '/api/states' && method === 'GET') {
    const u = await requireUser(request, env), track = url.searchParams.get('track');
    if (!TRACK_STEPS[track]) throw bad('Unknown programme.');
    const target = u.role === 'admin' && url.searchParams.get('user') ? await memberFor(env, u, url.searchParams.get('user')) : u;
    return json(computeStates(await userSubs(env, target.id, true), track));
  }
  if (path === '/api/progress' && method === 'GET') {
    const u = await requireUser(request, env);
    return json(progressOf(u, await userSubs(env, u.id)));
  }
  if (path === '/api/active-track' && method === 'POST') {
    const u = await requireUser(request, env), b = await body(request), t = str(b.track, 20);
    if (!TRACK_STEPS[t]) throw bad('That programme isn’t available.');
    const tracks = pub(u).tracks;
    if (!tracks.includes(t)) {
      if (u.role === 'member' && !can(u, 'choose_programme')) throw new HttpError(403, 'Your mentor chooses your programmes. Ask them in the chat.');
      tracks.push(t);
    }
    await DB.prepare('UPDATE users SET tracks = ?, active_track = ? WHERE id = ?').bind(JSON.stringify(tracks), t, u.id).run();
    if (u.role === 'member' && t !== u.active_track) record(env, ctx, 'member.programme', u.name + ' switched to ' + trackName(t), [['Member', u.name], ['Was on', trackName(u.active_track)], ['Now on', trackName(t)]], 'member-' + u.id, u.id, u.id);
    return json(pub(await withAccess(env, await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(u.id).first()))));
  }
  if (path === '/api/submissions' && method === 'GET') {
    const u = await requireUser(request, env), who = url.searchParams.get('user');
    const id = u.role === 'admin' && who ? (await memberFor(env, u, who)).id : u.id;
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

  /* published research: public, for research.html */
  if (path === '/api/research' && method === 'GET') return json({ research: await listResearch(env) });

  /* lessons: everyone signed in gets the owners' edits, layered over the built-in curriculum */
  if (path === '/api/lessons' && method === 'GET') {
    await requireUser(request, env);
    await ensureSchema(env);
    const { results } = await DB.prepare('SELECT l.key, l.data, l.updated_at, u.name AS by_name FROM lesson_edits l LEFT JOIN users u ON u.id = l.updated_by').all();
    const out = {};
    results.forEach((r) => { try { out[r.key] = { data: JSON.parse(r.data), by: r.by_name || '', at: r.updated_at }; } catch {} });
    return json(out);
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
    if (!can(u, 'chat')) throw new HttpError(403, 'Chat is turned off for your account.');
    const msg = await sendMessage(env, ctx, u.id, u, b.body, b.context);
    record(env, ctx, 'chat.member', u.name + ' sent a message', [['Member', u.name], ['About', msg.context], ['Message', msg.body.length > 500 ? msg.body.slice(0, 500) + '…' : msg.body]], 'chat-' + u.id, u.id, u.id);
    return json(msg, 201);
  }
  if (path === '/api/chat/unread' && method === 'GET') {
    const u = await requireUser(request, env);
    const [a, b] = await Promise.all([unreadFor(env, u), classUnread(env, u)]);
    return json({ unread: a.total + b });
  }

  /* classes: members see and chat in their own classes */
  if (path === '/api/classes' && method === 'GET') {
    const u = await requireUser(request, env);
    if (u.role !== 'member') throw bad('Mentors open classes from Messages.');
    return json(await classesOf(env, u));
  }
  if ((m = path.match(/^\/api\/classes\/([\w-]+)\/messages$/))) {
    const u = await requireUser(request, env);
    if (u.role !== 'member') throw bad('Mentors open classes from Messages.');
    const c = await classFor(env, u, m[1]);
    if (method === 'GET') return json({ class: await classInfo(env, c, u), messages: await classMessages(env, c.id, u.id, str(url.searchParams.get('after'), 40)) });
    if (method === 'POST') {
      if (!can(u, 'chat')) throw new HttpError(403, 'Chat is turned off for your account.');
      const msg = await sendClassMessage(env, c.id, u, (await body(request)).body);
      record(env, ctx, 'class.member', u.name + ' wrote in ' + c.name, [['Class', c.name], ['Message', msg.body.length > 500 ? msg.body.slice(0, 500) + '…' : msg.body]], 'class-' + c.id, u.id, u.id);
      return json(msg, 201);
    }
  }

  /* admin */
  if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Not found.');
  const admin = await requireAdmin(request, env);
  await Promise.all([ensureSchema(env), sealExisting(env)]);

  if (path === '/api/admin/stats' && method === 'GET') {
    const one = (sql, ...p) => DB.prepare(sql).bind(...p).first().then((r) => r.n);
    const sc = scopeOf(admin);
    const [unread, pending, pendingMine, members, myMembers, applications, approvedWeek] = await Promise.all([
      unreadFor(env, admin),
      one("SELECT COUNT(*) n FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'review' AND " + sc.sql, ...sc.args),
      one("SELECT COUNT(*) n FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'review' AND u.mentor_id = ?", admin.id),
      one("SELECT COUNT(*) n FROM users u WHERE u.role = 'member' AND u.active = 1 AND " + sc.sql, ...sc.args),
      one("SELECT COUNT(*) n FROM users WHERE role = 'member' AND mentor_id = ?", admin.id),
      can(admin, 'applications') ? one("SELECT COUNT(*) n FROM applications WHERE status = 'new'") : 0,
      one("SELECT COUNT(*) n FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'approved' AND s.reviewed_at > ? AND " + sc.sql, daysAgo(7), ...sc.args)
    ]);
    // day-by-day counts for the dashboard's chart and calendar (last 12 weeks)
    const since84 = daysAgo(84);
    const [subsByDay, reviewsByDay, reviewedTotal] = await Promise.all([
      DB.prepare("SELECT substr(s.created_at, 1, 10) d, COUNT(*) n FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.created_at > ? AND " + sc.sql + ' GROUP BY d').bind(since84, ...sc.args).all(),
      DB.prepare("SELECT substr(reviewed_at, 1, 10) d, COUNT(*) n FROM submissions WHERE reviewer_id = ? AND reviewed_at > ? GROUP BY d").bind(admin.id, since84).all(),
      one('SELECT COUNT(*) n FROM submissions WHERE reviewer_id = ? AND reviewed_at IS NOT NULL', admin.id)
    ]);
    const byDay = (r) => Object.fromEntries(r.results.map((x) => [x.d, x.n]));
    return json({ pending, pendingMine, members, myMembers, applications, approvedWeek, unreadChats: unread.total,
      submissionsByDay: byDay(subsByDay), reviewsByDay: byDay(reviewsByDay), reviewedTotal });
  }
  if (path === '/api/admin/activity' && method === 'GET') {
    await ensureSchema(env);
    const since = str(url.searchParams.get('since'), 40) || daysAgo(7);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit'), 10) || 50, 1), 200);
    const type = str(url.searchParams.get('type'), 40);
    // owners see everything; other mentors see their own actions, their members' activity and (if allowed) applications
    const scope = admin.owner ? '' : " AND (a.actor_id = ? OR a.member_id IN (SELECT u.id FROM users u WHERE u.role = 'member' AND " + scopeOf(admin).sql + ')' +
      (can(admin, 'applications') ? " OR a.type LIKE 'application.%'" : '') + ')';
    const args = admin.owner ? [] : [admin.id, ...scopeOf(admin).args];
    const { results } = await DB.prepare("SELECT a.*, u.name AS actor_name FROM activity a LEFT JOIN users u ON u.id = a.actor_id WHERE a.created_at > ? AND (? = '' OR a.type LIKE ? || '%')" + scope + ' ORDER BY a.created_at DESC LIMIT ?')
      .bind(since, type, type, ...args, limit).all();
    const events = await Promise.all(results.map(async (r) => {
      let detail = {}; try { detail = JSON.parse((await unseal(env, r.detail)) || '{}'); } catch {}
      return { id: r.id, type: r.type, summary: r.summary, at: r.created_at, by: r.actor_name || null, memberId: r.member_id || null,
        detail, link: r.link ? url.origin + '/portal.html#' + r.link : null };
    }));
    return json({ events, checkedAt: now() });
  }
  if (path === '/api/admin/connections' && method === 'GET') {
    await ensureSchema(env);
    if (!admin.owner) throw new HttpError(403, 'Connected apps are for owners only.');
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
    needPerm(admin, 'chat');
    const sc = scopeOf(admin);
    const [{ results }, unread] = await Promise.all([
      DB.prepare('SELECT m.*, u.name AS m_name, u.college AS m_college, u.mentor_id AS m_mentor, mt.name AS mentor_name, s.name AS s_name FROM messages m JOIN (SELECT member_id, MAX(created_at) AS mx FROM messages GROUP BY member_id) t ON t.member_id = m.member_id AND t.mx = m.created_at JOIN users u ON u.id = m.member_id LEFT JOIN users mt ON mt.id = u.mentor_id LEFT JOIN users s ON s.id = m.sender_id WHERE ' + sc.sql + ' ORDER BY m.created_at DESC').bind(...sc.args).all(),
      unreadFor(env, admin)
    ]);
    return json(await Promise.all(results.map(async (r) => ({
      member: { id: r.member_id, name: r.m_name, college: r.m_college || '', mentorId: r.m_mentor || null, mentorName: r.mentor_name || '' },
      mine: r.m_mentor === admin.id || (admin.owner && !r.m_mentor),
      last: { body: (await unseal(env, r.body)).slice(0, 160), role: r.sender_role, senderName: r.s_name || '', at: r.created_at },
      unread: unread.by[r.member_id] || 0
    }))));
  }
  if (path === '/api/admin/chats/unread' && method === 'GET') {
    const [a, b] = await Promise.all([unreadFor(env, admin), classUnread(env, admin)]);
    return json({ unread: a.total + b });
  }

  /* classes: owners make them; the class's mentor and owners chat in them */
  if (path === '/api/admin/classes' && method === 'GET') return json(await classesOf(env, admin));
  if (path === '/api/admin/classes' && method === 'POST') {
    needOwner(admin);
    const b = await body(request), name = str(b.name, 80);
    if (!name) throw bad('Give the class a name.');
    const mentor = await classMentor(env, b.mentorId), id = randomId('k'), t = now();
    await env.DB.prepare('INSERT INTO classes (id, name, mentor_id, created_by, created_at) VALUES (?, ?, ?, ?, ?)').bind(id, name, mentor ? mentor.id : null, admin.id, t).run();
    const ids = await saveClassMembers(env, id, b.memberIds);
    record(env, ctx, 'class.created', admin.name + ' made the class ' + name, [['Class', name], ['Mentor', mentor ? mentor.name : 'None'], ['Members', String(ids.length)]], 'class-' + id, admin.id);
    return json(await classInfo(env, await classRow(env, id), admin), 201);
  }
  if ((m = path.match(/^\/api\/admin\/classes\/([\w-]+)$/))) {
    const c = await classFor(env, admin, m[1]);
    if (method === 'GET') return json(await classInfo(env, c, admin));
    needOwner(admin);
    if (method === 'DELETE') {
      await env.DB.batch(['DELETE FROM class_messages WHERE class_id = ?', 'DELETE FROM class_members WHERE class_id = ?', 'DELETE FROM class_reads WHERE class_id = ?', 'DELETE FROM classes WHERE id = ?'].map((q) => env.DB.prepare(q).bind(c.id)));
      record(env, ctx, 'class.deleted', admin.name + ' deleted the class ' + c.name, [['Class', c.name]], '', admin.id);
      return json({ ok: true });
    }
    if (method === 'POST') {
      const b = await body(request), name = b.name !== undefined ? str(b.name, 80) : c.name;
      if (!name) throw bad('Give the class a name.');
      const mentor = b.mentorId !== undefined ? await classMentor(env, b.mentorId) : (c.mentor_id ? { id: c.mentor_id } : null);
      await env.DB.prepare('UPDATE classes SET name = ?, mentor_id = ? WHERE id = ?').bind(name, mentor ? mentor.id : null, c.id).run();
      if (b.memberIds !== undefined) await saveClassMembers(env, c.id, b.memberIds);
      record(env, ctx, 'class.updated', admin.name + ' updated the class ' + name, [['Class', name]], 'class-' + c.id, admin.id);
      return json(await classInfo(env, await classRow(env, c.id), admin));
    }
  }
  if ((m = path.match(/^\/api\/admin\/classes\/([\w-]+)\/messages$/))) {
    const c = await classFor(env, admin, m[1]);
    if (method === 'GET') return json({ class: await classInfo(env, c, admin), messages: await classMessages(env, c.id, admin.id, str(url.searchParams.get('after'), 40)) });
    if (method === 'POST') {
      const msg = await sendClassMessage(env, c.id, admin, (await body(request)).body);
      record(env, ctx, 'class.mentor', admin.name + ' wrote in ' + c.name, [['Class', c.name], ['Message', msg.body.length > 500 ? msg.body.slice(0, 500) + '…' : msg.body]], 'class-' + c.id, admin.id);
      return json(msg, 201);
    }
  }
  if ((m = path.match(/^\/api\/admin\/chat\/([\w-]+)$/))) {
    needPerm(admin, 'chat');
    const u = await memberFor(env, admin, m[1]);
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
  if ((m = path.match(/^\/api\/admin\/lesson\/([a-z]+)\/(\d+)$/)) && (method === 'POST' || method === 'DELETE')) {
    needPerm(admin, 'edit_lessons');
    const track = m[1], n = +m[2];
    if (!TRACK_STEPS[track] || n < 1 || n > TRACK_STEPS[track]) throw new HttpError(404, 'That step doesn’t exist.');
    const key = track + ':' + n, label = trackName(track) + ', Step ' + n;
    if (method === 'DELETE') {
      await DB.prepare('DELETE FROM lesson_edits WHERE key = ?').bind(key).run();
      record(env, ctx, 'lesson.reset', admin.name + ' reset ' + label + ' to the original', [['Step', label]], 'lesson-' + track + '-' + n, admin.id);
      return json({ ok: true });
    }
    const data = cleanLesson((await body(request)).data);
    if (!Object.keys(data).length) throw bad('Nothing to save.');
    await DB.prepare('INSERT INTO lesson_edits (key, data, updated_by, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (key) DO UPDATE SET data = excluded.data, updated_by = excluded.updated_by, updated_at = excluded.updated_at')
      .bind(key, JSON.stringify(data), admin.id, now()).run();
    record(env, ctx, 'lesson.edited', admin.name + ' edited ' + label, [['Step', label], ['Fields', Object.keys(data).join(', ')]], 'lesson-' + track + '-' + n, admin.id);
    return json({ ok: true, data });
  }

  /* published research: only owners add, change and remove papers */
  if (path === '/api/admin/research' && method === 'POST') {
    needOwner(admin);
    await ensureSchema(env);
    const r = cleanResearch(await body(request)), id = randomId('p'), t = now();
    await DB.prepare('INSERT INTO research (id, student, title, journal, year, kind, link, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, r.student, r.title, r.journal, r.year, r.kind, r.link, admin.id, t, t).run();
    record(env, ctx, 'research.added', admin.name + ' added a published paper by ' + r.student, [['Student', r.student], ['Title', r.title], ['Journal', r.journal]], 'research', admin.id);
    return json(pubResearch(await DB.prepare('SELECT * FROM research WHERE id = ?').bind(id).first()), 201);
  }
  if ((m = path.match(/^\/api\/admin\/research\/([\w-]+)$/)) && (method === 'POST' || method === 'DELETE')) {
    needOwner(admin);
    await ensureSchema(env);
    const old = await DB.prepare('SELECT * FROM research WHERE id = ?').bind(m[1]).first();
    if (!old) throw new HttpError(404, 'That paper isn’t on the list any more.');
    if (method === 'DELETE') {
      await DB.prepare('DELETE FROM research WHERE id = ?').bind(old.id).run();
      record(env, ctx, 'research.removed', admin.name + ' removed the paper by ' + old.student, [['Student', old.student], ['Title', old.title]], 'research', admin.id);
      return json({ ok: true });
    }
    const r = cleanResearch(await body(request));
    await DB.prepare('UPDATE research SET student = ?, title = ?, journal = ?, year = ?, kind = ?, link = ?, updated_at = ? WHERE id = ?')
      .bind(r.student, r.title, r.journal, r.year, r.kind, r.link, now(), old.id).run();
    record(env, ctx, 'research.edited', admin.name + ' edited the paper by ' + r.student, [['Student', r.student], ['Title', r.title]], 'research', admin.id);
    return json(pubResearch(await DB.prepare('SELECT * FROM research WHERE id = ?').bind(old.id).first()));
  }

  /* team: only owners add, change and remove mentors */
  if (path === '/api/admin/team' && method === 'GET') {
    needOwner(admin);
    const [{ results }, { results: counts }] = await Promise.all([
      DB.prepare("SELECT * FROM users WHERE role = 'admin' ORDER BY joined").all(),
      DB.prepare("SELECT mentor_id, COUNT(*) AS n FROM users WHERE role = 'member' GROUP BY mentor_id").all()
    ]);
    const n = {}; counts.forEach((c) => { n[c.mentor_id || ''] = c.n; });
    await openUsers(env, results);
    const [{ results: tfs }, { results: devs }] = await Promise.all([
      DB.prepare('SELECT user_id, enabled, recovery FROM two_factor').all(),
      DB.prepare('SELECT user_id, COUNT(*) AS n FROM trusted_devices WHERE expires > ? GROUP BY user_id').bind(now()).all()
    ]);
    const tfBy = {}; tfs.forEach((x) => { tfBy[x.user_id] = x; });
    const devBy = {}; devs.forEach((x) => { devBy[x.user_id] = x.n; });
    const team = await Promise.all(results.map(async (u) => ({ ...pub(await withAccess(env, u)), students: n[u.id] || 0,
      twoStep: { on: !!(tfBy[u.id] && tfBy[u.id].enabled), recoveryLeft: tfBy[u.id] ? JSON.parse(tfBy[u.id].recovery || '[]').length : 0, devices: devBy[u.id] || 0 } })));
    return json({ team, unassigned: n[''] || 0 });
  }
  if (path === '/api/admin/team' && method === 'POST') {
    needOwner(admin);
    const b = await body(request);
    const res = await createMentor(env, { name: b.name, email: b.email, phone: b.phone, title: b.title, password: b.password, perms: b.perms, owner: b.owner === true });
    record(env, ctx, 'team.added', admin.name + ' added ' + res.user.name + (res.user.owner ? ' as an owner' : ' as a mentor'), [['Mentor', res.user.name], ['Email', res.user.email]], 'admin-' + res.user.id, admin.id);
    return json(res, 201);
  }
  if ((m = path.match(/^\/api\/admin\/team\/([\w-]+)\/two-step$/)) && method === 'DELETE') {
    needOwner(admin);
    const t = await DB.prepare("SELECT id, name FROM users WHERE id = ? AND role = 'admin'").bind(m[1]).first();
    if (!t) throw new HttpError(404, 'Mentor not found.');
    // they set it up again on their next login; this also logs them out everywhere
    await DB.batch([
      DB.prepare('DELETE FROM two_factor WHERE user_id = ?').bind(t.id),
      DB.prepare('DELETE FROM trusted_devices WHERE user_id = ?').bind(t.id),
      DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(t.id)
    ]);
    record(env, ctx, 'team.two_step', admin.name + ' reset two-step verification for ' + t.name, [['Mentor', t.name]], 'admin-' + t.id, admin.id);
    return json({ ok: true });
  }
  if ((m = path.match(/^\/api\/admin\/team\/([\w-]+)(\/password)?$/))) {
    needOwner(admin);
    const t = await DB.prepare("SELECT * FROM users WHERE id = ? AND role = 'admin'").bind(m[1]).first();
    if (!t) throw new HttpError(404, 'Mentor not found.');
    await withAccess(env, await openUsers(env, t));
    const otherOwners = async () => (await DB.prepare("SELECT COUNT(*) AS n FROM user_perms p JOIN users u ON u.id = p.user_id WHERE p.owner = 1 AND u.active = 1 AND u.id != ?").bind(t.id).first()).n;
    if (m[2] && method === 'POST') {
      const b = await body(request), newPw = b.password ? pw(b.password) : tempPassword();
      if (newPw.length < 8) throw bad('Use at least 8 characters.');
      await setPassword(env, t.id, newPw);
      record(env, ctx, 'team.password', admin.name + (b.password ? ' set a new password for ' : ' reset the password for ') + t.name, [['Mentor', t.name]], 'admin-' + t.id, admin.id);
      return json({ user: pub(t), password: newPw });
    }
    if (!m[2] && method === 'POST') {
      const b = await body(request), changes = [];
      if (typeof b.owner === 'boolean' && b.owner !== t.owner) {
        if (!b.owner && !(await otherOwners())) throw bad('There must always be at least one owner.');
        changes.push(b.owner ? 'made owner' : 'no longer owner');
      }
      if (typeof b.active === 'boolean' && b.active !== (t.active !== 0)) {
        if (t.id === admin.id) throw bad('You can’t pause your own account.');
        if (!b.active && t.owner && !(await otherOwners())) throw bad('There must always be at least one owner.');
        await DB.prepare('UPDATE users SET active = ? WHERE id = ?').bind(b.active ? 1 : 0, t.id).run();
        if (!b.active) { await DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(t.id).run(); await revokeApps(env, t.id); }
        changes.push(b.active ? 'reactivated' : 'paused');
      }
      if (typeof b.title === 'string') { await DB.prepare('UPDATE users SET title = ? WHERE id = ?').bind(str(b.title, 100), t.id).run(); changes.push('title'); }
      if (b.perms || typeof b.owner === 'boolean') { await savePerms(env, t.id, 'admin', b.perms || {}, typeof b.owner === 'boolean' ? b.owner : undefined); if (b.perms) changes.push('permissions'); }
      const after = await withAccess(env, await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(t.id).first()));
      record(env, ctx, 'team.changed', admin.name + ' updated ' + t.name + (changes.length ? ' (' + changes.join(', ') + ')' : ''), [['Mentor', t.name], ['Owner', after.owner ? 'yes' : 'no'], ['Permissions', JSON.stringify(after.perms)]], 'admin-' + t.id, admin.id);
      return json(pub(after));
    }
    if (!m[2] && method === 'DELETE') {
      if (t.id === admin.id) throw bad('You can’t remove your own account.');
      if (t.owner && !(await otherOwners())) throw bad('There must always be at least one owner.');
      // their students stay, unassigned, so the owners pick them up
      await DB.batch([
        DB.prepare('UPDATE users SET mentor_id = NULL WHERE mentor_id = ?').bind(t.id),
        DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(t.id),
        DB.prepare('DELETE FROM oauth_tokens WHERE user_id = ?').bind(t.id),
        DB.prepare('DELETE FROM chat_reads WHERE reader_id = ?').bind(t.id),
        DB.prepare('DELETE FROM user_perms WHERE user_id = ?').bind(t.id),
        DB.prepare('DELETE FROM two_factor WHERE user_id = ?').bind(t.id),
        DB.prepare('DELETE FROM trusted_devices WHERE user_id = ?').bind(t.id),
        DB.prepare('DELETE FROM users WHERE id = ?').bind(t.id)
      ]);
      record(env, ctx, 'team.removed', admin.name + ' removed ' + t.name + ' from the team', [['Mentor', t.name], ['Email', t.email]], '', admin.id);
      return json({ ok: true });
    }
  }
  if (path === '/api/admin/mentors' && method === 'GET') {
    const { results } = await DB.prepare("SELECT * FROM users WHERE role = 'admin' ORDER BY joined").all();
    return json((await openUsers(env, results)).map(pub));
  }
  if (path === '/api/admin/queue' && method === 'GET') {
    const sc = scopeOf(admin);
    const { results } = await DB.prepare("SELECT s.*, u.name AS m_name, u.email AS m_email, u.phone AS m_phone, u.college AS m_college, u.mentor_id AS m_mentor FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'review' AND " + sc.sql + ' ORDER BY s.created_at ASC').bind(...sc.args).all();
    await openRows(env, results, ['m_phone']);
    return json(results.map((r) => ({ ...toSub(r), member: { id: r.user_id, name: r.m_name, email: r.m_email, phone: r.m_phone || '', college: r.m_college || '', mentorId: r.m_mentor || null } })));
  }
  if ((m = path.match(/^\/api\/admin\/submission\/([\w-]+)$/)) && method === 'GET') {
    const r = await DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(m[1]).first();
    if (!r) return json(null);
    const u = await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(r.user_id).first());
    if (!u || (!seesAll(admin) && u.mentor_id !== admin.id)) return json(null);
    const names = await adminNames(env);
    const { results } = await DB.prepare('SELECT * FROM submissions WHERE user_id = ? AND track = ? AND step = ? AND id != ? ORDER BY created_at DESC').bind(r.user_id, r.track, r.step, r.id).all();
    return json({ ...toSub(r, names), member: pub(u), history: results.map((x) => toSub(x, names)) });
  }
  if ((m = path.match(/^\/api\/admin\/review\/([\w-]+)$/)) && method === 'POST') {
    needPerm(admin, 'review');
    const owner = await DB.prepare('SELECT u.mentor_id FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.id = ?').bind(m[1]).first();
    if (!owner || (!seesAll(admin) && owner.mentor_id !== admin.id)) throw new HttpError(404, 'Submission not found.');
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
      DB.prepare("SELECT * FROM users u WHERE u.role = 'member' AND " + scopeOf(admin).sql).bind(...scopeOf(admin).args).all(),
      DB.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all()
    ]);
    await openUsers(env, users);
    const all = subs.map((r) => toSub(r));
    const out = await Promise.all(users.map((u) => memberSummary(env, u, names, all)));
    return json(out.sort((a, b) => (a.lastActive < b.lastActive ? 1 : -1)));
  }
  if (path === '/api/admin/members' && method === 'POST') {
    needPerm(admin, 'add_members');
    const b = await body(request);
    // only owners choose another mentor; everyone else adds members to themselves
    const res = await createMember(env, b, admin.owner ? (b.mentorId === '' ? null : str(b.mentorId, 40) || admin.id) : admin.id);
    record(env, ctx, 'member.added', admin.name + ' added ' + res.user.name, [['Member', res.user.name], ['Email', res.user.email]], 'member-' + res.user.id, admin.id, res.user.id);
    return json(res, 201);
  }
  /* open any step for a member without the earlier ones being approved (or close it again) */
  if ((m = path.match(/^\/api\/admin\/member\/([\w-]+)\/unlock$/)) && method === 'POST') {
    needPerm(admin, 'edit_members');
    const u = await memberFor(env, admin, m[1]), b = await body(request), track = str(b.track, 20), step = Math.round(Number(b.step));
    if (!TRACK_STEPS[track] || !pub(u).tracks.includes(track)) throw bad('This member isn’t following that programme.');
    if (!(step >= 1 && step <= TRACK_STEPS[track])) throw bad('That step doesn’t exist.');
    await ensureSchema(env);
    const label = trackName(track) + ', Step ' + step;
    if (b.unlock === false) {
      await DB.prepare('DELETE FROM step_unlocks WHERE user_id = ? AND track = ? AND step = ?').bind(u.id, track, step).run();
      record(env, ctx, 'member.step_locked', admin.name + ' locked ' + label + ' again for ' + u.name, [['Member', u.name], ['Step', label]], 'member-' + u.id, admin.id, u.id);
    } else {
      await DB.prepare('INSERT OR IGNORE INTO step_unlocks (user_id, track, step, unlocked_by, created_at) VALUES (?, ?, ?, ?, ?)').bind(u.id, track, step, admin.id, now()).run();
      record(env, ctx, 'member.step_unlocked', admin.name + ' unlocked ' + label + ' for ' + u.name, [['Member', u.name], ['Step', label]], 'member-' + u.id, admin.id, u.id);
    }
    return json({ states: computeStates(await userSubs(env, u.id, true), track) });
  }
  if ((m = path.match(/^\/api\/admin\/member\/([\w-]+)$/))) {
    const u = await memberFor(env, admin, m[1]);
    if (method === 'GET') {
      if (admin.owner) await withAccess(env, u);   // owners also see and change the member's permissions
      const names = await adminNames(env), subs = await userSubs(env, u.id, names);  // names reused below
      const states = {}; pub(u).tracks.forEach((t) => { states[t] = computeStates(subs, t); });
      return json({ ...(await memberSummary(env, u, names, subs)), states });
    }
    if (method === 'DELETE') {
      needPerm(admin, 'add_members');
      await ensureSchema(env);
      await DB.batch([
        DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM submissions WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM messages WHERE member_id = ?').bind(u.id),
        DB.prepare('DELETE FROM chat_reads WHERE member_id = ? OR reader_id = ?').bind(u.id, u.id),
        DB.prepare('UPDATE applications SET user_id = NULL WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM user_perms WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM user_prefs WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM step_unlocks WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM users WHERE id = ?').bind(u.id)
      ]);
      record(env, ctx, 'member.removed', admin.name + ' removed ' + u.name, [['Member', u.name], ['Email', u.email]], '', admin.id, u.id);
      return json({ ok: true });
    }
  }
  if ((m = path.match(/^\/api\/admin\/member\/([\w-]+)\/access$/)) && method === 'POST') {
    needOwner(admin);
    const u = await getMember(env, m[1]), b = await body(request);
    if (b.perms) await savePerms(env, u.id, 'member', b.perms);
    if (typeof b.active === 'boolean') {
      await DB.prepare('UPDATE users SET active = ? WHERE id = ?').bind(b.active ? 1 : 0, u.id).run();
      if (!b.active) await DB.batch([DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(u.id)]);
    }
    const after = await withAccess(env, await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(u.id).first()));
    record(env, ctx, 'member.access', admin.name + ' changed what ' + u.name + ' can do', [['Member', u.name], ['Active', after.active !== 0 ? 'yes' : 'paused'], ['Permissions', JSON.stringify(after.perms)]], 'member-' + u.id, admin.id, u.id);
    return json(pub(after));
  }
  if ((m = path.match(/^\/api\/admin\/member\/([\w-]+)\/(reset-password|password|mentor|tracks|phone)$/)) && method === 'POST') {
    const u = await memberFor(env, admin, m[1]), b = await body(request);
    if (m[2] === 'mentor') needOwner(admin);
    else needPerm(admin, m[2] === 'reset-password' || m[2] === 'password' ? 'passwords' : 'edit_members');
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
    needPerm(admin, 'applications');
    const { results } = await DB.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
    return json((await openRows(env, results, SEALED.applications)).map(toApp));
  }
  if ((m = path.match(/^\/api\/admin\/application\/([\w-]+)\/(paid|decline|approve)$/)) && method === 'POST') {
    needPerm(admin, 'applications');
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
const CONNECTOR_API = { asUser, ensureSchema, withAccess, needsTwoStep, deviceTrusted, twoStepOf, checkSecondFactor, record, hashPassword, safeEqual, sha256, hex, randomId, now, currentUser, openUsers, pub, trackName, TRACK_STEPS, TRACK_NAMES };
