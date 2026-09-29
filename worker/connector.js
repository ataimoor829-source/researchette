/* Researchette connector: an MCP server (Streamable HTTP) at /mcp, protected by OAuth 2.1.

   An AI app (Claude, Gemini, ChatGPT…) finds the login details at /.well-known/*, registers itself
   at /oauth/register, then sends a mentor to /oauth/authorize to log in and tap Allow. It gets a
   short-lived access token (refreshed automatically) and calls tools that act as that mentor, through
   the same routes and checks as the portal. Only mentor accounts can connect. Changing the mentor's
   password, or disconnecting the app in the portal, signs it out. */

const ACCESS_TTL = 3600;            // 1 hour
const REFRESH_TTL = 90 * 86400;     // 90 days
const CODE_TTL = 600;               // 10 minutes
const PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

export async function connector(request, env, ctx, url, api) {
  const path = url.pathname.replace(/\/+$/, '') || '/', method = request.method;
  if (method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
  await api.ensureSchema(env);

  if (path.startsWith('/.well-known/oauth-protected-resource')) return cors(jsonRes(resourceMeta(url)));
  if (path.startsWith('/.well-known/oauth-authorization-server') || path === '/.well-known/openid-configuration') return cors(jsonRes(serverMeta(url)));
  if (path === '/oauth/register' && method === 'POST') return cors(await register(request, env, api));
  if (path === '/oauth/authorize' && (method === 'GET' || method === 'POST')) return authorize(request, env, ctx, url, api);
  if (path === '/oauth/token' && method === 'POST') return cors(await token(request, env, api));
  if (path === '/oauth/revoke' && method === 'POST') return cors(await revoke(request, env, api));
  if (path === '/mcp') return cors(await mcp(request, env, ctx, url, api));
  return cors(jsonRes({ error: 'not_found' }, 404));
}

/* ---------- small helpers ---------- */
function jsonRes(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers } });
}
// The connector is called by apps from their own servers (and sometimes browsers) with bearer tokens,
// never cookies, so it's safe to allow any origin.
function cors(res) {
  const h = new Headers(res.headers);
  h.set('access-control-allow-origin', '*');
  h.set('access-control-allow-methods', 'GET, POST, DELETE, OPTIONS');
  h.set('access-control-allow-headers', 'authorization, content-type, mcp-protocol-version, mcp-session-id, last-event-id');
  h.set('access-control-expose-headers', 'www-authenticate, mcp-session-id, mcp-protocol-version');
  h.set('access-control-max-age', '86400');
  return new Response(res.body, { status: res.status, headers: h });
}
const oauthError = (error, description, status = 400) => jsonRes({ error, error_description: description }, status);
function b64url(bytes) { let s = ''; new Uint8Array(bytes).forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function randomToken(prefix) { return prefix + b64url(crypto.getRandomValues(new Uint8Array(32))); }
async function pkce(verifier) { return b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))); }
const future = (sec) => new Date(Date.now() + sec * 1000).toISOString();
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
async function formOrJson(request) {
  const type = request.headers.get('content-type') || '';
  try {
    if (type.includes('application/json')) return await request.json();
    const f = await request.formData(), o = {};
    for (const [k, v] of f.entries()) o[k] = typeof v === 'string' ? v : '';
    return o;
  } catch { return {}; }
}
// redirect URIs must be https, or http on this computer (for desktop apps)
function okRedirect(u) {
  try {
    const x = new URL(u);
    if (x.hash) return false;
    if (x.protocol === 'https:') return true;
    return x.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(x.hostname);
  } catch { return false; }
}

/* ---------- discovery ---------- */
function resourceMeta(url) {
  return { resource: url.origin + '/mcp', authorization_servers: [url.origin], bearer_methods_supported: ['header'], scopes_supported: ['admin'], resource_name: 'Researchette' };
}
function serverMeta(url) {
  const o = url.origin;
  return {
    issuer: o,
    authorization_endpoint: o + '/oauth/authorize',
    token_endpoint: o + '/oauth/token',
    registration_endpoint: o + '/oauth/register',
    revocation_endpoint: o + '/oauth/revoke',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post', 'client_secret_basic'],
    revocation_endpoint_auth_methods_supported: ['none', 'client_secret_post', 'client_secret_basic'],
    scopes_supported: ['admin'],
    service_documentation: o + '/'
  };
}

/* ---------- dynamic client registration (RFC 7591) ---------- */
async function register(request, env, api) {
  const b = await formOrJson(request);
  const uris = Array.isArray(b.redirect_uris) ? b.redirect_uris.map(String).slice(0, 10) : [];
  if (!uris.length || !uris.every(okRedirect)) return oauthError('invalid_redirect_uri', 'Give at least one https redirect URI.');
  const method = ['none', 'client_secret_post', 'client_secret_basic'].includes(b.token_endpoint_auth_method) ? b.token_endpoint_auth_method : 'none';
  const name = String(b.client_name || 'AI assistant').slice(0, 100);
  const clientId = randomToken('rtc_');
  const secret = method === 'none' ? null : randomToken('rts_');
  await env.DB.prepare('INSERT INTO oauth_clients (client_id, secret_hash, name, redirect_uris, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(clientId, secret ? await api.sha256(secret) : null, name, JSON.stringify(uris), api.now()).run();
  const out = {
    client_id: clientId, client_id_issued_at: Math.floor(Date.now() / 1000), client_name: name, redirect_uris: uris,
    token_endpoint_auth_method: method, grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], scope: 'admin'
  };
  if (secret) { out.client_secret = secret; out.client_secret_expires_at = 0; }
  return jsonRes(out, 201);
}
async function getClient(env, id) {
  if (!id) return null;
  const c = await env.DB.prepare('SELECT * FROM oauth_clients WHERE client_id = ?').bind(String(id)).first();
  if (c) c.uris = JSON.parse(c.redirect_uris || '[]');
  return c;
}
// checks the client secret for confidential clients; public clients (no secret) rely on PKCE
async function clientAuth(request, b, env, api) {
  let id = b.client_id, secret = b.client_secret;
  const basic = (request.headers.get('authorization') || '').match(/^Basic\s+(.+)$/i);
  if (basic) {
    try {
      const [u, p] = atob(basic[1]).split(':');
      id = decodeURIComponent(u); secret = decodeURIComponent(p || '');
    } catch { return null; }
  }
  const c = await getClient(env, id);
  if (!c) return null;
  if (c.secret_hash && !(secret && api.safeEqual(await api.sha256(String(secret)), c.secret_hash))) return null;
  return c;
}

/* ---------- authorize: the mentor logs in and approves ---------- */
async function authorize(request, env, ctx, url, api) {
  const q = request.method === 'POST' ? await formOrJson(request) : Object.fromEntries(url.searchParams);
  const client = await getClient(env, q.client_id);
  // With an unknown app or redirect address we can't safely send the browser back, so say so here.
  if (!client) return page('This app isn’t registered', '<p>Remove the connector from your AI app and add it again.</p>', 400);
  const redirect = q.redirect_uri || (client.uris.length === 1 ? client.uris[0] : '');
  if (!client.uris.includes(redirect)) return page('Unknown return address', '<p>The app asked to return to an address it didn’t register. Remove the connector and add it again.</p>', 400);
  const back = (params) => {
    const r = new URL(redirect);
    Object.entries({ ...params, state: q.state, iss: url.origin }).forEach(([k, v]) => { if (v) r.searchParams.set(k, v); });
    return new Response(null, { status: 302, headers: { location: r.toString(), 'cache-control': 'no-store' } });
  };
  if (q.response_type !== 'code') return back({ error: 'unsupported_response_type' });
  if (!q.code_challenge || (q.code_challenge_method || 'plain') !== 'S256') return back({ error: 'invalid_request', error_description: 'PKCE with S256 is required.' });

  const session = await api.currentUser(request, env);
  const signedIn = session && session.role === 'admin' ? session : null;
  const hidden = ['client_id', 'redirect_uri', 'response_type', 'code_challenge', 'code_challenge_method', 'state', 'scope', 'resource']
    .map((k) => '<input type="hidden" name="' + k + '" value="' + esc(k === 'redirect_uri' ? redirect : q[k] || '') + '">').join('');
  const consent = (error) => page('Connect ' + client.name + ' to Researchette',
    '<p class="lede"><b>' + esc(client.name) + '</b> wants to manage Researchette as you. It will be able to:</p>' +
    '<ul><li>See applications, members, submissions and activity</li><li>Approve or decline applications and create logins</li>' +
    '<li>Review submissions and give feedback</li><li>Add or remove members, change programmes, mentors and passwords</li></ul>' +
    '<p class="small">Only connect apps you trust. You can disconnect it any time from the portal’s account menu, and changing your password disconnects every app. It will return you to <b>' + esc(new URL(redirect).host) + '</b>.</p>' +
    '<form method="post" action="/oauth/authorize">' + hidden +
      (signedIn
        ? '<p class="who">Signed in as <b>' + esc(signedIn.name) + '</b> (' + esc(signedIn.email) + ')</p>'
        : '<label for="e">Mentor email</label><input id="e" name="email" type="email" autocomplete="username" required value="' + esc(q.email || '') + '">' +
          '<label for="p">Password</label><input id="p" name="password" type="password" autocomplete="current-password" required>') +
      (error ? '<p class="error" role="alert">' + esc(error) + '</p>' : '') +
      '<div class="row"><button class="btn quiet" name="action" value="deny" type="submit" formnovalidate>Cancel</button><button class="btn" name="action" value="allow" type="submit">Allow</button></div>' +
    '</form>', error ? 401 : 200);

  if (request.method === 'GET') return consent();
  if (q.action === 'deny') return back({ error: 'access_denied' });

  let user = signedIn;
  if (!user) {
    const u = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(String(q.email || '').trim().toLowerCase().slice(0, 200)).first();
    const ok = u && api.safeEqual((await api.hashPassword(String(q.password || '').trim(), u.pw_salt)).hash, u.pw_hash);
    if (!ok) return consent('That email and password don’t match.');
    if (u.role !== 'admin' || u.active === 0) return consent('Only mentor accounts can connect apps.');
    user = u;
  }
  const code = randomToken('rtk_');
  await env.DB.batch([
    env.DB.prepare('DELETE FROM oauth_codes WHERE expires < ?').bind(api.now()),
    env.DB.prepare('INSERT INTO oauth_codes (code_hash, client_id, user_id, redirect_uri, challenge, scope, resource, expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(await api.sha256(code), client.client_id, user.id, redirect, String(q.code_challenge), 'admin', String(q.resource || ''), future(CODE_TTL))
  ]);
  api.record(env, ctx, 'admin.connector', user.name + ' connected ' + client.name, [['App', client.name], ['Returns to', new URL(redirect).host]], '', user.id);
  return back({ code });
}

/* ---------- token ---------- */
async function issue(env, api, clientId, userId, resource) {
  const access = randomToken('rta_'), refresh = randomToken('rtr_'), t = api.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM oauth_tokens WHERE expires < ?').bind(t),
    env.DB.prepare('INSERT INTO oauth_tokens (token_hash, kind, client_id, user_id, scope, resource, expires, created_at) VALUES (?, \'access\', ?, ?, \'admin\', ?, ?, ?)')
      .bind(await api.sha256(access), clientId, userId, resource || '', future(ACCESS_TTL), t),
    env.DB.prepare('INSERT INTO oauth_tokens (token_hash, kind, client_id, user_id, scope, resource, expires, created_at) VALUES (?, \'refresh\', ?, ?, \'admin\', ?, ?, ?)')
      .bind(await api.sha256(refresh), clientId, userId, resource || '', future(REFRESH_TTL), t)
  ]);
  return jsonRes({ access_token: access, token_type: 'Bearer', expires_in: ACCESS_TTL, refresh_token: refresh, scope: 'admin' }, 200, { pragma: 'no-cache' });
}
async function activeMentor(env, id) {
  const u = await env.DB.prepare("SELECT * FROM users WHERE id = ? AND role = 'admin' AND active = 1").bind(id).first();
  return u || null;
}
async function token(request, env, api) {
  const b = await formOrJson(request);
  const client = await clientAuth(request, b, env, api);
  if (!client) return oauthError('invalid_client', 'Unknown app or wrong client secret.', 401);

  if (b.grant_type === 'authorization_code') {
    const h = await api.sha256(String(b.code || ''));
    const c = await env.DB.prepare('SELECT * FROM oauth_codes WHERE code_hash = ?').bind(h).first();
    await env.DB.prepare('DELETE FROM oauth_codes WHERE code_hash = ?').bind(h).run();   // single use
    if (!c || c.expires < api.now() || c.client_id !== client.client_id) return oauthError('invalid_grant', 'This sign-in code is invalid or has expired.');
    if (b.redirect_uri && b.redirect_uri !== c.redirect_uri) return oauthError('invalid_grant', 'The return address doesn’t match.');
    if (!b.code_verifier || (await pkce(String(b.code_verifier))) !== c.challenge) return oauthError('invalid_grant', 'PKCE check failed.');
    if (!(await activeMentor(env, c.user_id))) return oauthError('invalid_grant', 'This mentor account is no longer active.');
    return issue(env, api, client.client_id, c.user_id, c.resource);
  }
  if (b.grant_type === 'refresh_token') {
    const h = await api.sha256(String(b.refresh_token || ''));
    const t = await env.DB.prepare("SELECT * FROM oauth_tokens WHERE token_hash = ? AND kind = 'refresh'").bind(h).first();
    if (!t || t.expires < api.now() || t.client_id !== client.client_id) return oauthError('invalid_grant', 'Please connect again.');
    if (!(await activeMentor(env, t.user_id))) return oauthError('invalid_grant', 'This mentor account is no longer active.');
    await env.DB.prepare('DELETE FROM oauth_tokens WHERE token_hash = ?').bind(h).run();   // rotate
    return issue(env, api, client.client_id, t.user_id, t.resource);
  }
  return oauthError('unsupported_grant_type', 'Use authorization_code or refresh_token.');
}
async function revoke(request, env, api) {
  const b = await formOrJson(request);
  const client = await clientAuth(request, b, env, api);
  if (client && b.token) await env.DB.prepare('DELETE FROM oauth_tokens WHERE token_hash = ? AND client_id = ?').bind(await api.sha256(String(b.token)), client.client_id).run();
  return new Response(null, { status: 200 });
}
async function bearerUser(request, env, api) {
  const m = (request.headers.get('authorization') || '').match(/^Bearer\s+(\S+)$/i);
  if (!m) return { error: null };
  const t = await env.DB.prepare("SELECT * FROM oauth_tokens WHERE token_hash = ? AND kind = 'access'").bind(await api.sha256(m[1])).first();
  if (!t || t.expires < api.now()) return { error: 'invalid_token' };
  const u = await activeMentor(env, t.user_id);
  if (!u) return { error: 'invalid_token' };
  const c = await getClient(env, t.client_id);
  return { user: await api.openUsers(env, u), client: c ? c.name : 'Connected app' };
}

/* ---------- MCP (Streamable HTTP, JSON responses, stateless) ---------- */
async function mcp(request, env, ctx, url, api) {
  if (request.method !== 'POST') return jsonRes({ error: 'Use POST for MCP requests.' }, 405, { allow: 'POST, OPTIONS' });
  const auth = await bearerUser(request, env, api);
  if (!auth.user) {
    const meta = url.origin + '/.well-known/oauth-protected-resource';
    return jsonRes({ error: auth.error || 'unauthorized', error_description: 'Connect with your Researchette mentor account.' }, 401,
      { 'www-authenticate': 'Bearer realm="Researchette", resource_metadata="' + meta + '"' + (auth.error ? ', error="' + auth.error + '"' : '') + ', scope="admin"' });
  }
  let msg;
  try { msg = await request.json(); } catch { return jsonRes(rpcError(null, -32700, 'Parse error')); }
  const batch = Array.isArray(msg), list = batch ? msg : [msg];
  const out = [];
  for (const m of list) {
    if (!m || typeof m !== 'object' || m.jsonrpc !== '2.0') { out.push(rpcError(null, -32600, 'Invalid request')); continue; }
    if (m.id === undefined || m.id === null) continue;          // notifications need no answer
    out.push(await handle(m, env, ctx, url, api, auth));
  }
  if (!out.length) return new Response(null, { status: 202 });
  return jsonRes(batch ? out : out[0]);
}
const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

async function handle(m, env, ctx, url, api, auth) {
  const ok = (result) => ({ jsonrpc: '2.0', id: m.id, result });
  switch (m.method) {
    case 'initialize': {
      const asked = m.params && m.params.protocolVersion;
      return ok({
        protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'researchette', title: 'Researchette', version: '1.0.0' },
        instructions: 'Researchette is a medical research mentorship programme. You are acting as the mentor ' + auth.user.name + '. ' +
          'Use get_recent_activity to see what is new (applications, submissions, chat messages, logins, reviews); pass the checkedAt value from the last call as "since" next time. ' +
          'Applications: mark paid, then approve to create the student login (the temporary password is returned once; share it only with the student). ' +
          'Reviews: read the submission, then review_submission with feedback. Chat: list_chats shows unread conversations; reply with send_chat_message. Ask the user before destructive actions like removing a member or declining an application.'
      });
    }
    case 'ping': return ok({});
    case 'tools/list': return ok({ tools: TOOLS.map(({ run, ...t }) => t) });
    case 'tools/call': {
      const p = m.params || {}, tool = TOOLS.find((t) => t.name === p.name);
      if (!tool) return rpcError(m.id, -32602, 'Unknown tool: ' + p.name);
      const call = (method, path, data) => api.asUser(env, ctx, url.origin, auth.user, method, path, data);
      try {
        const data = await tool.run(p.arguments || {}, call, api, auth);
        return ok({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: Array.isArray(data) ? { items: data } : data, isError: false });
      } catch (e) {
        return ok({ content: [{ type: 'text', text: e.message || 'Something went wrong.' }], isError: true });
      }
    }
    default: return rpcError(m.id, -32601, 'Method not found: ' + m.method);
  }
}

/* ---------- tools ---------- */
async function need(res) {
  const r = await res;
  if (r.status >= 400) throw new Error((r.body && r.body.error) || 'Request failed (' + r.status + ').');
  return r.body;
}
const id = (d) => ({ type: 'string', description: d });
const q = encodeURIComponent;
const READ = { readOnlyHint: true, openWorldHint: false };
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const DANGER = { readOnlyHint: false, destructiveHint: true, openWorldHint: false };
const PROGRAMMES = { type: 'array', items: { type: 'string', enum: ['original', 'case', 'letter', 'synopsis', 'thesis', 'meta'] }, description: 'Programme ids: original (Original article), case (Case report), letter (Letter to the editor), synopsis, thesis, meta (Systematic review & meta-analysis).' };
const obj = (properties = {}, required = []) => ({ type: 'object', properties, required, additionalProperties: false });

const TOOLS = [
  { name: 'get_overview', title: 'Overview', description: 'Counts: submissions waiting for review (all and yours), active members, your students, new applications, approvals this week.',
    inputSchema: obj(), annotations: READ, run: (a, call) => need(call('GET', '/api/admin/stats')) },
  { name: 'get_recent_activity', title: 'Recent activity', description: 'What happened recently, newest first: new applications, submissions and resubmissions, member logins, password and programme changes, reviews and mentor actions. Use for notifications: pass the checkedAt from the previous call as since.',
    inputSchema: obj({ since: { type: 'string', description: 'ISO date-time; only events after this. Default: last 7 days.' }, type: { type: 'string', description: 'Filter by type prefix, e.g. "application", "submission", "review", "member".' }, limit: { type: 'integer', minimum: 1, maximum: 200, description: 'Default 50.' } }),
    annotations: READ, run: (a, call) => need(call('GET', '/api/admin/activity?since=' + q(a.since || '') + '&type=' + q(a.type || '') + '&limit=' + q(a.limit || 50))) },
  { name: 'list_programmes', title: 'Programmes', description: 'The programmes members can follow, with their ids and number of steps.',
    inputSchema: obj(), annotations: READ, run: (a, call, api) => Object.keys(api.TRACK_STEPS).map((k) => ({ id: k, name: api.TRACK_NAMES[k], steps: api.TRACK_STEPS[k] })) },
  { name: 'list_mentors', title: 'Mentors', description: 'Mentor accounts (ids, names, emails).',
    inputSchema: obj(), annotations: READ, run: (a, call) => need(call('GET', '/api/admin/mentors')) },

  { name: 'list_applications', title: 'Applications', description: 'Membership applications from the website, newest first, with contact details, answers, payment and status.',
    inputSchema: obj({ status: { type: 'string', enum: ['new', 'approved', 'declined', 'all'], description: 'Default: new.' } }), annotations: READ,
    run: async (a, call) => { const all = await need(call('GET', '/api/admin/applications')), s = a.status || 'new'; return s === 'all' ? all : all.filter((x) => x.status === s); } },
  { name: 'mark_application_paid', title: 'Mark application paid', description: 'Record whether the membership fee for an application has been received.',
    inputSchema: obj({ application_id: id('Application id'), paid: { type: 'boolean' } }, ['application_id', 'paid']), annotations: { ...WRITE, idempotentHint: true },
    run: (a, call) => need(call('POST', '/api/admin/application/' + q(a.application_id) + '/paid', { paid: !!a.paid })) },
  { name: 'approve_application', title: 'Approve application', description: 'Accept an application and create the student’s portal login, assigned to you. Returns the login email and a temporary password (shown once) to send to the student.',
    inputSchema: obj({ application_id: id('Application id') }, ['application_id']), annotations: WRITE,
    run: (a, call) => need(call('POST', '/api/admin/application/' + q(a.application_id) + '/approve', {})) },
  { name: 'decline_application', title: 'Decline application', description: 'Decline an application. Confirm with the user first.',
    inputSchema: obj({ application_id: id('Application id') }, ['application_id']), annotations: DANGER,
    run: (a, call) => need(call('POST', '/api/admin/application/' + q(a.application_id) + '/decline', {})) },

  { name: 'list_review_queue', title: 'Review queue', description: 'Submissions waiting for review, oldest first, with the member and the answer text.',
    inputSchema: obj({ mine_only: { type: 'boolean', description: 'Only your own students.' } }), annotations: READ,
    run: async (a, call, api, auth) => { const all = await need(call('GET', '/api/admin/queue')); return a.mine_only ? all.filter((s) => s.member.mentorId === auth.user.id) : all; } },
  { name: 'get_submission', title: 'Submission', description: 'One submission: the answer, its status and feedback, the member, and earlier attempts at the same step.',
    inputSchema: obj({ submission_id: id('Submission id') }, ['submission_id']), annotations: READ,
    run: async (a, call) => { const s = await need(call('GET', '/api/admin/submission/' + q(a.submission_id))); if (!s) throw new Error('Submission not found.'); return s; } },
  { name: 'review_submission', title: 'Review submission', description: 'Approve a submission (unlocks the next step) or request changes. Feedback is shown to the student; it is required when requesting changes.',
    inputSchema: obj({ submission_id: id('Submission id'), decision: { type: 'string', enum: ['approved', 'revision'] }, feedback: { type: 'string', description: 'What is good, what to fix and how.' } }, ['submission_id', 'decision']),
    annotations: WRITE,
    run: (a, call) => {
      const fb = String(a.feedback || '').trim();
      if (a.decision === 'revision' && !fb) throw new Error('Write feedback explaining what needs to change.');
      return need(call('POST', '/api/admin/review/' + q(a.submission_id), { decision: a.decision, feedback: fb || 'Well done. Approved.' }));
    } },

  { name: 'list_chats', title: 'Chats', description: 'Portal chat conversations with members, newest first, with the last message and how many unread messages each has for you.',
    inputSchema: obj({ unread_only: { type: 'boolean' } }), annotations: READ,
    run: async (a, call) => { const all = await need(call('GET', '/api/admin/chats')); return a.unread_only ? all.filter((c) => c.unread) : all; } },
  { name: 'get_chat', title: 'Chat', description: 'The full chat with one member (oldest first). Reading it marks it as read for you.',
    inputSchema: obj({ member_id: id('Member id') }, ['member_id']), annotations: READ,
    run: (a, call) => need(call('GET', '/api/admin/chat/' + q(a.member_id))) },
  { name: 'send_chat_message', title: 'Send chat message', description: 'Reply to a member in the portal chat, as you. The member sees it next time they open the portal. Show the user the message before sending.',
    inputSchema: obj({ member_id: id('Member id'), message: { type: 'string', maxLength: 4000 } }, ['member_id', 'message']), annotations: WRITE,
    run: (a, call) => need(call('POST', '/api/admin/chat/' + q(a.member_id), { body: a.message })) },

  { name: 'list_members', title: 'Members', description: 'All members with progress, current step, mentor and last activity. Optionally search by name, email or college.',
    inputSchema: obj({ search: { type: 'string' } }), annotations: READ,
    run: async (a, call) => { const all = await need(call('GET', '/api/admin/members')), t = String(a.search || '').toLowerCase(); return t ? all.filter((u) => [u.name, u.email, u.college].join(' ').toLowerCase().includes(t)) : all; } },
  { name: 'get_member', title: 'Member', description: 'One member in full: details, programmes, progress and the status of every step.',
    inputSchema: obj({ member_id: id('Member id') }, ['member_id']), annotations: READ,
    run: async (a, call) => { const u = await need(call('GET', '/api/admin/member/' + q(a.member_id))); if (!u) throw new Error('Member not found.'); return u; } },
  { name: 'add_member', title: 'Add member', description: 'Create a member login directly (without an application). Returns a temporary password (shown once) unless you set one.',
    inputSchema: obj({ name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string', description: 'WhatsApp number, e.g. 0339 5888444' }, college: { type: 'string' }, level: { type: 'string' }, programmes: PROGRAMMES, mentor_id: id('Mentor id; default you'), password: { type: 'string', description: 'At least 8 characters; default a temporary password.' } }, ['name', 'email']),
    annotations: WRITE,
    run: (a, call) => need(call('POST', '/api/admin/members', { name: a.name, email: a.email, phone: a.phone, college: a.college, level: a.level, tracks: a.programmes, mentorId: a.mentor_id, password: a.password })) },
  { name: 'remove_member', title: 'Remove member', description: 'Permanently delete a member, their login, submissions and feedback. Cannot be undone. Always confirm with the user first, then pass confirm: true.',
    inputSchema: obj({ member_id: id('Member id'), confirm: { type: 'boolean', description: 'Must be true.' } }, ['member_id', 'confirm']), annotations: DANGER,
    run: (a, call) => { if (a.confirm !== true) throw new Error('Confirm with the user, then call again with confirm: true.'); return need(call('DELETE', '/api/admin/member/' + q(a.member_id))); } },
  { name: 'reset_member_password', title: 'Reset member password', description: 'Give a member a new temporary password (returned once) and sign them out everywhere.',
    inputSchema: obj({ member_id: id('Member id') }, ['member_id']), annotations: DANGER,
    run: (a, call) => need(call('POST', '/api/admin/member/' + q(a.member_id) + '/reset-password', {})) },
  { name: 'set_member_password', title: 'Set member password', description: 'Set a specific password for a member (at least 8 characters) and sign them out everywhere.',
    inputSchema: obj({ member_id: id('Member id'), password: { type: 'string', minLength: 8 } }, ['member_id', 'password']), annotations: DANGER,
    run: (a, call) => need(call('POST', '/api/admin/member/' + q(a.member_id) + '/password', { password: a.password })) },
  { name: 'assign_mentor', title: 'Assign mentor', description: 'Assign a member to a mentor (use list_mentors for ids). Pass an empty mentor_id to remove the assignment.',
    inputSchema: obj({ member_id: id('Member id'), mentor_id: id('Mentor id, or empty') }, ['member_id', 'mentor_id']), annotations: { ...WRITE, idempotentHint: true },
    run: (a, call) => need(call('POST', '/api/admin/member/' + q(a.member_id) + '/mentor', { mentorId: a.mentor_id || '' })) },
  { name: 'set_member_programmes', title: 'Set member programmes', description: 'Choose which programmes a member can follow (at least one). Progress in a removed programme is kept.',
    inputSchema: obj({ member_id: id('Member id'), programmes: PROGRAMMES }, ['member_id', 'programmes']), annotations: { ...WRITE, idempotentHint: true },
    run: (a, call) => need(call('POST', '/api/admin/member/' + q(a.member_id) + '/tracks', { tracks: a.programmes })) },
  { name: 'set_member_phone', title: 'Set member WhatsApp number', description: 'Save or clear a member’s WhatsApp number.',
    inputSchema: obj({ member_id: id('Member id'), phone: { type: 'string', description: 'e.g. 0339 5888444, or empty to remove' } }, ['member_id', 'phone']), annotations: { ...WRITE, idempotentHint: true },
    run: (a, call) => need(call('POST', '/api/admin/member/' + q(a.member_id) + '/phone', { phone: a.phone || '' })) }
];

/* ---------- the approval page ---------- */
function page(title, inner, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>
:root{--paper:#F4F7FC;--card:#fff;--ink:#18203D;--muted:#5F6989;--line:rgba(24,32,61,.12);--pen:#3448D8;--on:#fff;--red:#DD4460}
@media (prefers-color-scheme:dark){:root{--paper:#0C1022;--card:#161C38;--ink:#EAEFFF;--muted:#A1AACB;--line:rgba(255,255,255,.12);--pen:#8FA0FF;--on:#0C1022;--red:#FF8599}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:var(--paper);color:var(--ink);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
main{width:min(100%,460px);background:var(--card);border:1px solid var(--line);border-radius:22px;padding:28px;box-shadow:0 18px 40px -22px rgba(40,50,110,.35)}
.logo{font-weight:800;letter-spacing:-.03em;font-size:1.15rem}.logo i{font-style:normal;color:var(--pen)}
h1{font-size:1.45rem;line-height:1.2;letter-spacing:-.02em;margin:16px 0 10px}p{margin:0 0 12px}ul{margin:0 0 14px;padding-left:1.2em}li{margin:4px 0}
.small{font-size:.86rem;color:var(--muted)}.who{margin:16px 0 4px}label{display:block;font-weight:600;font-size:.9rem;margin:14px 0 6px}
input{width:100%;font:inherit;color:inherit;background:transparent;padding:.75em .9em;border:1px solid var(--line);border-radius:12px}
input:focus{outline:2px solid var(--pen);outline-offset:1px}.error{color:var(--red);font-size:.9rem;margin-top:12px}
.row{display:flex;gap:10px;margin-top:20px}.btn{flex:1;font:600 1rem inherit;font-family:inherit;padding:.85em 1em;border-radius:999px;border:0;background:var(--pen);color:var(--on);cursor:pointer;transition:transform .1s ease-out}
.btn:active{transform:scale(.97)}.btn.quiet{background:transparent;color:var(--ink);border:1px solid var(--line)}
</style></head><body><main><div class="logo">research<i>ette</i></div><h1>${esc(title)}</h1>${inner}</main></body></html>`;
  return new Response(html, { status, headers: {
    'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-frame-options': 'DENY', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'"
  } });
}
