/* Researchette API (Cloudflare Worker + D1).
   Serves /api/* and hands every other request to the static site in ./public.
   Passwords are hashed with PBKDF2-SHA256; sessions are random tokens in an HttpOnly cookie,
   stored only as a SHA-256 hash. */

// Number of steps in each programme. Keep in sync with public/assets/curriculum.js.
const TRACK_STEPS = { original: 10, case: 6, letter: 4, synopsis: 6, thesis: 6, meta: 7 };
const GOALS = { 'Original article': 'original', 'Synopsis': 'synopsis', 'Thesis': 'thesis', 'Meta-analysis': 'meta', 'Systematic review / meta-analysis': 'meta', 'Case report': 'case', 'Letter to the editor': 'letter' };
const COOKIE = 'rt_s';
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      return await route(request, env, url);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
  }
};

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const bad = (m) => new HttpError(400, m);

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
async function body(request) {
  try { return await request.json(); } catch { throw bad('Invalid request.'); }
}
function str(v, max = 2000) { return String(v == null ? '' : v).trim().slice(0, max); }
function now() { return new Date().toISOString(); }
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
  return row || null;
}
async function requireUser(request, env) { const u = await currentUser(request, env); if (!u) throw new HttpError(401, 'Please log in again.'); return u; }
async function requireAdmin(request, env) { const u = await requireUser(request, env); if (u.role !== 'admin') throw new HttpError(403, 'Mentors only.'); return u; }
async function getMember(env, id) {
  const u = await env.DB.prepare("SELECT * FROM users WHERE id = ? AND role = 'member'").bind(id).first();
  if (!u) throw new HttpError(404, 'Member not found.');
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
  const { results } = await env.DB.prepare('SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all();
  return results.map((r) => toSub(r, reviewers));
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
  const password = data.password ? String(data.password) : tempPassword();
  if (password.length < 8) throw bad('Use at least 8 characters for the password.');
  if (mentorId && !(await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'admin'").bind(mentorId).first())) mentorId = null;
  const { hash, salt } = await hashPassword(password);
  const id = randomId('u');
  await env.DB.prepare('INSERT INTO users (id, role, name, email, phone, pw_hash, pw_salt, college, level, tracks, active_track, mentor_id, joined) VALUES (?, \'member\', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, name, email, str(data.phone, 40), hash, salt, str(data.college, 200), str(data.level, 100), JSON.stringify(tracks), tracks[0], mentorId || null, now()).run();
  const u = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
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
async function route(request, env, url) {
  const path = url.pathname.replace(/\/+$/, ''), method = request.method, DB = env.DB;
  let m;

  /* public */
  if (path === '/api/login' && method === 'POST') {
    const b = await body(request);
    const u = await DB.prepare('SELECT * FROM users WHERE email = ?').bind(str(b.email, 200).toLowerCase()).first();
    const ok = u && safeEqual((await hashPassword(String(b.password || ''), u.pw_salt)).hash, u.pw_hash);
    if (!ok) throw new HttpError(401, 'That email and password don’t match. Check them and try again.');
    if (u.active === 0) throw new HttpError(403, 'This account is paused. Contact your mentor.');
    const token = hex(crypto.getRandomValues(new Uint8Array(32)));
    const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
    await DB.batch([
      DB.prepare('DELETE FROM sessions WHERE expires < ?').bind(now()),
      DB.prepare('INSERT INTO sessions (token_hash, user_id, expires) VALUES (?, ?, ?)').bind(await sha256(token), u.id, expires.toISOString())
    ]);
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
      .bind(id, name, email, str(b.phone, 40), str(b.college, 200), str(b.level, 100), str(b.experience, 100), JSON.stringify(goals), str(b.why, 3000), now()).run();
    return json({ id }, 201);
  }

  /* signed in: own account */
  if (path === '/api/me/password' && method === 'POST') {
    const u = await requireUser(request, env), b = await body(request);
    if (!safeEqual((await hashPassword(String(b.current || ''), u.pw_salt)).hash, u.pw_hash)) throw bad('Your current password isn’t right.');
    const next = String(b.next || '');
    if (next.length < 8) throw bad('Use at least 8 characters for the new password.');
    if (next === b.current) throw bad('Choose a password that’s different from the current one.');
    const { hash, salt } = await hashPassword(next);
    await DB.prepare('UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?').bind(hash, salt, u.id).run();
    return json({ ok: true });
  }

  /* member */
  if (path === '/api/states' && method === 'GET') {
    const u = await requireUser(request, env), track = url.searchParams.get('track');
    if (!TRACK_STEPS[track]) throw bad('Unknown programme.');
    const target = u.role === 'admin' && url.searchParams.get('user') ? await getMember(env, url.searchParams.get('user')) : u;
    return json(computeStates(await userSubs(env, target.id, await adminNames(env)), track));
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
    return json(pub(await DB.prepare('SELECT * FROM users WHERE id = ?').bind(u.id).first()));
  }
  if (path === '/api/submissions' && method === 'GET') {
    const u = await requireUser(request, env), who = url.searchParams.get('user');
    const id = u.role === 'admin' && who ? (await getMember(env, who)).id : u.id;
    return json(await userSubs(env, id, await adminNames(env)));
  }
  if (path === '/api/submit' && method === 'POST') {
    const u = await requireUser(request, env), b = await body(request), track = str(b.track, 20), step = Number(b.step), text = str(b.text, 20000);
    if (!TRACK_STEPS[track]) throw bad('Unknown programme.');
    if (!text) throw bad('Write your answer before submitting.');
    const st = computeStates(await userSubs(env, u.id), track)[step - 1];
    if (!st || (st.status !== 'current' && st.status !== 'revision')) throw bad('This step can’t be submitted right now.');
    const id = randomId('s');
    await DB.prepare('INSERT INTO submissions (id, user_id, track, step, text, status, created_at) VALUES (?, ?, ?, ?, ?, \'review\', ?)').bind(id, u.id, track, step, text, now()).run();
    return json({ id }, 201);
  }

  /* admin */
  if (!path.startsWith('/api/admin/')) throw new HttpError(404, 'Not found.');
  const admin = await requireAdmin(request, env);

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
    return json(results.map(pub));
  }
  if (path === '/api/admin/queue' && method === 'GET') {
    const { results } = await DB.prepare("SELECT s.*, u.name AS m_name, u.email AS m_email, u.phone AS m_phone, u.college AS m_college, u.mentor_id AS m_mentor FROM submissions s JOIN users u ON u.id = s.user_id WHERE s.status = 'review' ORDER BY s.created_at ASC").all();
    return json(results.map((r) => ({ ...toSub(r), member: { id: r.user_id, name: r.m_name, email: r.m_email, phone: r.m_phone || '', college: r.m_college || '', mentorId: r.m_mentor || null } })));
  }
  if ((m = path.match(/^\/api\/admin\/submission\/([\w-]+)$/)) && method === 'GET') {
    const r = await DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(m[1]).first();
    if (!r) return json(null);
    const u = await DB.prepare('SELECT * FROM users WHERE id = ?').bind(r.user_id).first();
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
    const names = await adminNames(env);
    const { results: users } = await DB.prepare("SELECT * FROM users WHERE role = 'member'").all();
    const { results: subs } = await DB.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
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
      const names = await adminNames(env), subs = await userSubs(env, u.id, names);
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
      const pw = m[2] === 'password' ? String(b.password || '') : tempPassword();
      if (pw.length < 8) throw bad('Use at least 8 characters.');
      await setPassword(env, u.id, pw);
      return json({ user: pub(u), password: pw });
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
    if (m[2] === 'phone') await DB.prepare('UPDATE users SET phone = ? WHERE id = ?').bind(str(b.phone, 40), u.id).run();
    return json(pub(await DB.prepare('SELECT * FROM users WHERE id = ?').bind(u.id).first()));
  }
  if (path === '/api/admin/applications' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
    return json(results.map(toApp));
  }
  if ((m = path.match(/^\/api\/admin\/application\/([\w-]+)\/(paid|decline|approve)$/)) && method === 'POST') {
    const a = await DB.prepare('SELECT * FROM applications WHERE id = ?').bind(m[1]).first();
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
