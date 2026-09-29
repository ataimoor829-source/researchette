/* Researchette API (Cloudflare Worker + D1).
   Serves /api/* and hands every other request to the static site in ./public.
   Passwords are hashed with PBKDF2-SHA256; sessions are random tokens in an HttpOnly cookie,
   stored only as a SHA-256 hash. Phone numbers and application answers are encrypted in the
   database with AES-256-GCM, using the DATA_KEY secret set in Cloudflare (never in this code). */

// Number of steps in each programme. Keep in sync with public/assets/curriculum.js.
const TRACK_STEPS = { original: 10, case: 6, letter: 4, synopsis: 6, thesis: 6, meta: 7 };
const GOALS = { 'Original article': 'original', 'Synopsis': 'synopsis', 'Thesis': 'thesis', 'Meta-analysis': 'meta', 'Systematic review / meta-analysis': 'meta', 'Case report': 'case', 'Letter to the editor': 'letter' };
const TRACK_NAMES = { original: 'Original article', case: 'Case report', letter: 'Letter to the editor', synopsis: 'Synopsis', thesis: 'Thesis', meta: 'Systematic review & meta-analysis' };
const COOKIE = 'rt_s';
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
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

/* ---------- alerts to the founder ----------
   WhatsApp through CallMeBot (callmebot.com) when the CALLMEBOT_KEY secret is set, and email through
   Resend (resend.com) when RESEND_API_KEY is set. Either, both or neither can be on. Sending happens
   after the response, so members never wait for it. */
function escHtml(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function alertFounder(env, ctx, url, subject, rows, linkHash, linkLabel) {
  const portal = url.origin + '/portal.html' + (linkHash ? '#' + linkHash : '');
  const later = (p) => { if (ctx && ctx.waitUntil) ctx.waitUntil(p); };
  if (env.CALLMEBOT_KEY) {
    // WhatsApp keeps it short: long answers are cut, the full text is one tap away in the portal
    const lines = rows.filter((r) => r[1]).map(([k, v]) => k + ': ' + (String(v).length > 300 ? String(v).slice(0, 300) + '…' : v));
    const msg = '*Researchette* · ' + subject + '\n\n' + lines.join('\n') + '\n\n' + portal;
    const q = new URLSearchParams({ phone: env.ALERT_WHATSAPP || '923395888444', text: msg, apikey: env.CALLMEBOT_KEY.trim() });
    later(fetch('https://api.callmebot.com/whatsapp.php?' + q)
      .then((r) => { if (!r.ok) return r.text().then((t) => console.error('alert whatsapp failed', r.status, t.slice(0, 200))); })
      .catch((e) => console.error('alert whatsapp failed', e)));
  }
  if (!env.RESEND_API_KEY) return;
  const table = rows.filter((r) => r[1]).map(([k, v]) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#5F6989;vertical-align:top;white-space:nowrap">${escHtml(k)}</td><td style="padding:6px 0;color:#18203D;white-space:pre-wrap">${escHtml(v)}</td></tr>`).join('');
  const html = `<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;max-width:560px">
<p style="margin:0 0 4px;color:#0B9E8C;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Researchette</p>
<h2 style="margin:0 0 16px;color:#18203D;font-size:20px">${escHtml(subject)}</h2>
<table style="border-collapse:collapse">${table}</table>
<p style="margin:22px 0 0"><a href="${escHtml(portal)}" style="background:#3448D8;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">${escHtml(linkLabel || 'Open the portal')}</a></p></div>`;
  const text = subject + '\n\n' + rows.filter((r) => r[1]).map(([k, v]) => k + ': ' + v).join('\n') + '\n\n' + portal;
  const send = fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.ALERT_FROM || 'Researchette <onboarding@resend.dev>', to: [env.ALERT_EMAIL || 'itszainr1@gmail.com'], subject: 'Researchette: ' + subject, html, text })
  }).then((r) => { if (!r.ok) return r.text().then((t) => console.error('alert email failed', r.status, t)); }).catch((e) => console.error('alert email failed', e));
  later(send);
}
const trackName = (t) => TRACK_NAMES[t] || t;

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
async function currentUser(request, env) {
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
    if (u.role === 'member') alertFounder(env, ctx, url, u.name + ' logged in', [['Member', u.name], ['Email', u.email]], 'member-' + u.id, 'View ' + u.name.split(' ')[0]);
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
    alertFounder(env, ctx, url, 'New application from ' + name, [
      ['Name', name], ['Email', email], ['WhatsApp', str(b.phone, 40)], ['College', str(b.college, 200)], ['Level', str(b.level, 100)],
      ['Experience', str(b.experience, 100)], ['Interested in', goals.join(', ')], ['Why', str(b.why, 3000)]
    ], 'applications', 'Review applications');
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
    if (u.role === 'member') alertFounder(env, ctx, url, u.name + ' changed their password', [['Member', u.name], ['Email', u.email]], 'member-' + u.id, 'View ' + u.name.split(' ')[0]);
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
    if (u.role === 'member' && t !== u.active_track) alertFounder(env, ctx, url, u.name + ' switched to ' + trackName(t), [['Member', u.name], ['Was on', trackName(u.active_track)], ['Now on', trackName(t)]], 'member-' + u.id, 'View ' + u.name.split(' ')[0]);
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
    alertFounder(env, ctx, url, u.name + (again ? ' resubmitted ' : ' submitted ') + trackName(track) + ', Step ' + step, [
      ['Member', u.name], ['Programme', trackName(track)], ['Step', String(step)], ['Words', String(text.split(/\s+/).filter(Boolean).length)],
      ['Answer', text.length > 1500 ? text.slice(0, 1500) + '…' : text]
    ], 'review-' + id, 'Review it');
    return json({ id }, 201);
  }

  /* admin */
  if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Not found.');
  const admin = await requireAdmin(request, env);
  await sealExisting(env);

  if (path === '/api/admin/stats' && method === 'GET') {
    const one = (sql, ...p) => DB.prepare(sql).bind(...p).first().then((r) => r.n);
    const [pending, pendingMine, members, myMembers, applications, approvedWeek] = await Promise.all([
      one("SELECT COUNT(*) n FROM submissions WHERE status = 'review'"),
      one("SELECT COUNT(*) n FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'review' AND u.mentor_id = ?", admin.id),
      one("SELECT COUNT(*) n FROM users WHERE role = 'member' AND active = 1"),
      one("SELECT COUNT(*) n FROM users WHERE role = 'member' AND mentor_id = ?", admin.id),
      one("SELECT COUNT(*) n FROM applications WHERE status = 'new'"),
      one("SELECT COUNT(*) n FROM submissions WHERE status = 'approved' AND reviewed_at > ?", daysAgo(7))
    ]);
    return json({ pending, pendingMine, members, myMembers, applications, approvedWeek });
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
    return json(await createMember(env, b, str(b.mentorId, 40) || admin.id), 201);
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
        DB.prepare('UPDATE applications SET user_id = NULL WHERE user_id = ?').bind(u.id),
        DB.prepare('DELETE FROM users WHERE id = ?').bind(u.id)
      ]);
      return json({ ok: true });
    }
  }
  if ((m = path.match(/^\/api\/admin\/member\/([\w-]+)\/(reset-password|password|mentor|tracks|phone)$/)) && method === 'POST') {
    const u = await getMember(env, m[1]), b = await body(request);
    if (m[2] === 'reset-password' || m[2] === 'password') {
      const newPw = m[2] === 'password' ? pw(b.password) : tempPassword();
      if (newPw.length < 8) throw bad('Use at least 8 characters.');
      await setPassword(env, u.id, newPw);
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
    return json(pub(await openUsers(env, await DB.prepare('SELECT * FROM users WHERE id = ?').bind(u.id).first())));
  }
  if (path === '/api/admin/applications' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
    return json((await openRows(env, results, SEALED.applications)).map(toApp));
  }
  if ((m = path.match(/^\/api\/admin\/application\/([\w-]+)\/(paid|decline|approve)$/)) && method === 'POST') {
    const a = await openRows(env, await DB.prepare('SELECT * FROM applications WHERE id = ?').bind(m[1]).first(), SEALED.applications);
    if (!a) throw new HttpError(404, 'Application not found.');
    if (m[2] === 'paid') { const b = await body(request); await DB.prepare('UPDATE applications SET paid = ? WHERE id = ?').bind(b.paid ? 1 : 0, a.id).run(); return json({ ok: true }); }
    if (a.status !== 'new') throw bad('This application has already been handled.');
    if (m[2] === 'decline') { await DB.prepare("UPDATE applications SET status = 'declined' WHERE id = ?").bind(a.id).run(); return json({ ok: true }); }
    const tracks = JSON.parse(a.goals || '[]').map((g) => GOALS[g]).filter(Boolean);
    const res = await createMember(env, { name: a.name, email: a.email, phone: a.phone, college: a.college, level: a.level, tracks }, admin.id);
    await DB.prepare("UPDATE applications SET status = 'approved', user_id = ? WHERE id = ?").bind(res.user.id, a.id).run();
    return json(res);
  }
  throw new HttpError(404, 'Not found.');
}
