/* Researchette data layer: talks to the Cloudflare Worker API (/api/*), which stores
   everything in the D1 database. The pages only use the methods below. */
window.Store = (function () {
  function call(method, path, data) {
    return fetch(path, {
      method: method,
      credentials: 'same-origin',
      headers: data ? { 'content-type': 'application/json' } : {},
      body: data ? JSON.stringify(data) : undefined
    }).then(function (res) {
      var isJson = (res.headers.get('content-type') || '').indexOf('application/json') > -1;
      if (!isJson) throw new Error('The Researchette server isn’t reachable from this page. Open the portal on the live website and try again.');
      return res.json().catch(function () { return null; }).then(function (body) {
        if (!res.ok) throw new Error((body && body.error) || 'Something went wrong. Check your connection and try again.');
        return body;
      });
    }, function () { throw new Error('Can’t reach the server. Check your internet connection and try again.'); });
  }
  /* Re-visiting a screen within a few seconds reuses the last answer instead of waiting
     on the network; anything that changes data clears it so nothing goes stale. */
  var cache = {}, TTL = 15000;
  var get = function (p) {
    var hit = cache[p];
    if (hit && Date.now() - hit.t < TTL) return hit.p;
    var pr = call('GET', p);
    cache[p] = { t: Date.now(), p: pr };
    pr.catch(function () { delete cache[p]; });
    return pr;
  };
  var post = function (p, d) { cache = {}; return call('POST', p, d || {}); };
  var q = encodeURIComponent;

  return {
    demo: false,

    /* account */
    signIn: function (email, password) { return post('/api/login', { email: email, password: password }); },
    signOut: function () { return post('/api/logout'); },
    me: function () { return call('GET', '/api/me').catch(function () { return null; }); },
    changePassword: function (_userId, current, next) { return post('/api/me/password', { current: current, next: next }); },

    /* member */
    stepStates: function (_userId, track) { return get('/api/states?track=' + q(track)); },
    progress: function () { return get('/api/progress'); },
    setActiveTrack: function (_userId, track) { return post('/api/active-track', { track: track }); },
    submissions: function (userId) { return get('/api/submissions?user=' + q(userId || '')); },
    submit: function (_userId, track, step, text) { return post('/api/submit', { track: track, step: step, text: text }); },

    /* chat (never cached, so new messages show up straight away) */
    chat: function (after) { return call('GET', '/api/chat' + (after ? '?after=' + q(after) : '')); },
    sendChat: function (body, context) { return post('/api/chat', { body: body, context: context || '' }); },
    unread: function () { return call('GET', '/api/chat/unread'); },
    chats: function () { return call('GET', '/api/admin/chats'); },
    chatWith: function (memberId, after) { return call('GET', '/api/admin/chat/' + q(memberId) + (after ? '?after=' + q(after) : '')); },
    sendChatTo: function (memberId, body) { return post('/api/admin/chat/' + q(memberId), { body: body }); },
    adminUnread: function () { return call('GET', '/api/admin/chats/unread'); },

    /* website form */
    addApplication: function (data) { return post('/api/applications', data); },

    /* mentor */
    stats: function () { return get('/api/admin/stats'); },
    mentors: function () { return get('/api/admin/mentors'); },
    queue: function () { return get('/api/admin/queue'); },
    submission: function (id) { return get('/api/admin/submission/' + q(id)); },
    review: function (id, decision, feedback) { return post('/api/admin/review/' + q(id), { decision: decision, feedback: feedback }); },
    members: function () { return get('/api/admin/members'); },
    member: function (id) { return get('/api/admin/member/' + q(id)).catch(function () { return null; }); },
    addMember: function (data, mentorId) { return post('/api/admin/members', Object.assign({}, data, { mentorId: mentorId })); },
    removeMember: function (id) { cache = {}; return call('DELETE', '/api/admin/member/' + q(id)); },
    resetPassword: function (id) { return post('/api/admin/member/' + q(id) + '/reset-password'); },
    setPassword: function (id, pw) { return post('/api/admin/member/' + q(id) + '/password', { password: pw }); },
    assignMentor: function (id, mentorId) { return post('/api/admin/member/' + q(id) + '/mentor', { mentorId: mentorId || '' }); },
    setTracks: function (id, tracks) { return post('/api/admin/member/' + q(id) + '/tracks', { tracks: tracks }); },
    setPhone: function (id, phone) { return post('/api/admin/member/' + q(id) + '/phone', { phone: phone }); },
    applications: function () { return get('/api/admin/applications'); },
    setPaid: function (id, paid) { return post('/api/admin/application/' + q(id) + '/paid', { paid: !!paid }); },
    decline: function (id) { return post('/api/admin/application/' + q(id) + '/decline'); },
    approveApplication: function (id) { return post('/api/admin/application/' + q(id) + '/approve'); },
    connections: function () { return call('GET', '/api/admin/connections'); },
    disconnect: function (clientId) { cache = {}; return call('DELETE', '/api/admin/connection/' + q(clientId)); }
  };
})();
