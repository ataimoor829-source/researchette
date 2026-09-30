/* Researchette portal: login, member portal and admin (mentor) portal in one page.
   Routes live in the URL hash: #login, #today, #roadmap, #step-3, #feedback, #chat,
   #overview, #reviews, #review-<id>, #members, #member-<id>, #applications, #messages, #chat-<member id>,
   #team, #admin-<id>, #lessons, #lesson-<track>-<n> (owners). */
(function () {
  var S = window.Store, C = window.CURRICULUM, app = document.getElementById('app');
  var me = null, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  var P = {
    today: '<rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4"/>',
    map: '<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 6l-10 7L2 6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    chev: '<path d="M9 18l6-6-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    alert: '<path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/>',
    wa: '<path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/><path d="M9 9.5c.3 1.8 1.7 3.7 3.5 4.6l1.2-1 1.8.8-.4 1.6c-3 .1-6.9-3.4-7-6.6l1.5-.5.8 1.7z"/>',
    done: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
    msgs: '<path d="M14 9a2 2 0 0 1-2 2H6l-3 3V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-3-3h-6a2 2 0 0 1-2-2v-1"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4M5 17v3M6.5 18.5h-3"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M11 18h2"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'
  };
  function ic(n, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>'; }
  var LOGO = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="7" fill="#3448D8"/><path d="M5 13h3l2-5 3 9 2-4h4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var LABEL = { approved: 'Approved', review: 'In review', revision: 'Needs changes', current: 'To do', locked: 'Locked', new: 'New', declined: 'Declined' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(n) { return esc(String(n || '?').split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase()); }
  // first name, keeping a title with it ("Dr Sobia" rather than "Dr")
  function short(n) { var w = String(n || '').trim().split(/\s+/); return /^(dr|prof|mr|mrs|ms|miss)\.?$/i.test(w[0]) && w[1] ? w[0] + ' ' + w[1] : w[0]; }
  function first(n) { return esc(short(n)); }
  function words(t) { return (String(t).trim().match(/\S+/g) || []).length; }
  function rel(iso) {
    var s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    if (s < 172800) return 'yesterday';
    if (s < 30 * 86400) return Math.round(s / 86400) + ' days ago';
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }
  function greet() { var h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
  function today() { return new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }); }
  function pill(st) { return '<span class="pill ' + st + '">' + LABEL[st] + '</span>'; }
  function T(id) { return C.track(id); }
  function stepOf(t, n) { return T(t).steps[n - 1]; }
  /* Owners' edits to lesson text (from the server) are layered over curriculum.js. The original of
     every step is kept so an edit can be undone and so "Reset" shows the built-in wording. */
  var ORIGINAL = {}, lessonEdits = {}, lessonsReady = null;
  var EDITABLE = ['title', 'summary', 'minutes', 'intro', 'lesson', 'example', 'mistakes', 'include', 'template', 'task'];
  function applyLessons(map) {
    lessonEdits = map || {};
    C.tracks.forEach(function (tr) {
      tr.steps.forEach(function (st) {
        var key = tr.id + ':' + st.n;
        if (!ORIGINAL[key]) { var o = {}; EDITABLE.forEach(function (f) { if (st[f] !== undefined) o[f] = JSON.parse(JSON.stringify(st[f])); }); ORIGINAL[key] = o; }
        EDITABLE.forEach(function (f) { if (ORIGINAL[key][f] !== undefined) st[f] = JSON.parse(JSON.stringify(ORIGINAL[key][f])); else delete st[f]; });
        var e = lessonEdits[key];
        if (e && e.data) {
          Object.keys(e.data).forEach(function (f) {
            if (f === 'task') st.task = Object.assign({}, st.task, e.data.task);
            else if (f === 'mistakes' || f === 'include') { if (e.data[f].length) st[f] = e.data[f]; else delete st[f]; }
            else if ((f === 'intro' || f === 'template') && !e.data[f]) delete st[f];
            else st[f] = e.data[f];
          });
        }
      });
    });
  }
  function loadLessons(force) {
    if (force || !lessonsReady) lessonsReady = S.lessons().then(applyLessons, function () { lessonsReady = null; });
    return lessonsReady;
  }
  function phaseOf(t, n) { var tr = T(t), st = stepOf(t, n); return tr.phases.filter(function (p) { return p.id === st.phase; })[0] || tr.phases[0]; }
  var LEVELS = ['MBBS (1st–2nd year)', 'MBBS (3rd–5th year)', 'BDS', 'Pharm-D / DPT / Nursing / Allied health', 'House officer / graduate doctor', 'Postgraduate trainee (FCPS / MS / MD)', 'MPhil / PhD', 'Other'];
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function sicon(st, n) {
    var inner = st === 'approved' ? ic('check') : st === 'review' ? ic('clock') : st === 'revision' ? '!' : st === 'locked' ? ic('lock') : n;
    return '<span class="sicon ' + st + '">' + inner + '</span>';
  }

  function toast(msg) {
    document.querySelectorAll('.toast').forEach(function (x) { x.remove(); });
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3100);
  }
  function sheet(html, mount) {
    var bg = document.createElement('div'); bg.className = 'sheet-bg';
    bg.innerHTML = '<div class="sheet glass" role="dialog" aria-modal="true"><div class="grab" aria-hidden="true"></div>' + html + '</div>';
    document.body.appendChild(bg);
    var sh = bg.querySelector('.sheet'), closing = false;
    /* leave the way it came in: the same path, played in reverse */
    function close() {
      if (closing) return; closing = true;
      document.removeEventListener('keydown', key);
      bg.classList.add('out');
      var done = function () { bg.remove(); };
      if (reduce) done(); else { sh.addEventListener('animationend', done, { once: true }); setTimeout(done, 400); }
    }
    function key(e) { if (e.key === 'Escape') close(); }
    /* phones: drag the sheet down to dismiss. It follows the finger 1:1, resists upward pulls,
       and a quick flick closes it even when it hasn't travelled far. */
    if (matchMedia('(max-width: 760px)').matches) {
      var y0 = null, dy = 0, lastY = 0, lastT = 0, v = 0;
      sh.addEventListener('pointerdown', function (e) {
        if (!e.target.closest('.grab')) return;
        sh.setPointerCapture(e.pointerId);
        y0 = lastY = e.clientY; lastT = e.timeStamp; v = 0; dy = 0;
      });
      sh.addEventListener('pointermove', function (e) {
        if (y0 === null) return;
        dy = e.clientY - y0;
        if (e.timeStamp > lastT) { v = (e.clientY - lastY) / (e.timeStamp - lastT); lastY = e.clientY; lastT = e.timeStamp; }
        var y = dy > 0 ? dy : -Math.sqrt(-dy) * 3;
        sh.style.transition = 'none'; sh.style.transform = 'translateY(' + y + 'px)';
        bg.style.setProperty('--drag', Math.max(0, Math.min(1, dy / sh.offsetHeight)));
      });
      var end = function (e) {
        if (y0 === null) return; y0 = null;
        if (e.timeStamp - lastT > 90) v = 0; /* the finger paused before letting go: no flick */
        sh.style.transition = ''; bg.style.removeProperty('--drag');
        /* project where a flick would carry the sheet, not just where the finger let go */
        if (dy + v * 200 > sh.offsetHeight * .35) { sh.style.transform = 'translateY(100%)'; bg.classList.add('out', 'dragged'); setTimeout(function () { bg.remove(); }, 320); closing = true; document.removeEventListener('keydown', key); }
        else sh.style.transform = '';
      };
      sh.addEventListener('pointerup', end); sh.addEventListener('pointercancel', end);
    }
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    document.addEventListener('keydown', key);
    bg.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    if (mount) mount(bg.querySelector('.sheet'), close);
    var f = bg.querySelector('[data-autofocus]') || bg.querySelector('button, input, textarea'); if (f) f.focus({ preventScroll: true });
    return close;
  }
  function copy(text, fallbackEl) {
    try {
      navigator.clipboard.writeText(text).then(function () { toast('Copied'); }, fallback);
    } catch (e) { fallback(); }
    function fallback() {
      if (!fallbackEl) return;
      var r = document.createRange(); r.selectNodeContents(fallbackEl);
      var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Selected. Copy it from here.');
    }
  }
  /* WhatsApp links: Pakistani numbers like 0339 5888444 become 923395888444 */
  function waNumber(p) {
    var d = String(p || '').replace(/\D/g, '');
    if (/^0\d{10}$/.test(d)) d = '92' + d.slice(1);
    else if (/^3\d{9}$/.test(d)) d = '92' + d;
    return d.length >= 11 ? d : '';
  }
  function waLink(num, text) { return 'https://wa.me/' + num + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function waButton(num, text, label, cls) {
    return '<a class="btn btn-wa ' + (cls || '') + '" href="' + esc(waLink(num, text)) + '" target="_blank" rel="noopener">' + ic('wa') + esc(label) + '</a>';
  }
  /* what the signed-in person may do: owners everything, everyone else what the owners allow */
  function can(p) { return !!me && ((me.role === 'admin' && me.owner) || !!(me.perms && me.perms[p])); }
  function isOwner() { return !!me && me.role === 'admin' && !!me.owner; }
  function seesAll() { return isOwner() || can('see_all'); }
  function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
  function setHash(h) { try { history.replaceState(null, '', '#' + h); } catch (e) {} }

  /* theme: system by default; a choice made in the account sheet is remembered on this device */
  function applyTheme() {
    var t = store('rt-portal-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  applyTheme();

  /* ---------- shell ---------- */
  var TABS = {
    member: [{ id: 'today', label: 'Today', icon: 'today' }, { id: 'roadmap', label: 'Roadmap', icon: 'map' }, { id: 'feedback', label: 'Feedback', icon: 'chat' }, { id: 'chat', label: 'Chat', icon: 'msgs', badge: 'unread' }],
    admin: [{ id: 'overview', label: 'Overview', icon: 'home' }, { id: 'reviews', label: 'Reviews', icon: 'inbox', badge: 'pending' }, { id: 'messages', label: 'Messages', icon: 'msgs', badge: 'unreadChats' }, { id: 'members', label: 'Members', icon: 'users' }, { id: 'applications', label: 'Applications', icon: 'mail', badge: 'applications' }]
  };
  function myTabs() {
    return TABS[me.role].filter(function (t) {
      if (t.id === 'applications') return can('applications');
      if (t.id === 'messages' || t.id === 'chat') return can('chat');
      return true;
    });
  }
  function tabsHtml(cls) {
    return '<nav class="tabs ' + cls + '" aria-label="Sections">' + myTabs().map(function (t) {
      return '<a href="#' + t.id + '" data-tab="' + t.id + '">' + ic(t.icon) + '<span>' + t.label + '</span>' + (t.badge ? '<span class="badge" data-badge="' + t.badge + '" hidden></span>' : '') + '</a>';
    }).join('') + '<span class="ind" aria-hidden="true"></span></nav>';
  }
  function ensureShell() {
    var key = shellKey();
    if (app.dataset.shell === key) return;
    app.dataset.shell = key;
    var home = me.role === 'admin' ? 'overview' : 'today';
    app.innerHTML =
      '<header class="topbar"><div class="shell"><div class="topbar-inner">' +
        '<a class="logo" href="#' + home + '">' + LOGO + '<span>research<i>ette</i></span>' + (me.role === 'admin' ? '<span class="role">' + (me.owner ? 'Owner' : 'Mentor') + '</span>' : '') + '</a>' +
        tabsHtml('top') +
        '<div class="top-actions"><button class="avatar-btn" id="acct" type="button" aria-label="Account and settings"><span class="avatar ' + (me.role === 'admin' ? '' : 'warm') + '">' + initials(me.name) + '</span></button></div>' +
      '</div></div></header>' +
      '<main class="view shell" id="view"></main>' + tabsHtml('bottom');
    document.getElementById('acct').addEventListener('click', accountSheet);
  }
  function shellKey() { return me.id + ':' + me.role + ':' + (me.owner ? 1 : 0) + ':' + JSON.stringify(me.perms || {}); }
  function setTabs(active, badges) {
    app.querySelectorAll('.tabs').forEach(function (nav) {
      var on = null;
      nav.querySelectorAll('a').forEach(function (a) {
        var is = a.dataset.tab === active; a.classList.toggle('on', is); if (is) { on = a; a.setAttribute('aria-current', 'page'); } else a.removeAttribute('aria-current');
      });
      nav.querySelectorAll('[data-badge]').forEach(function (b) { var v = badges && badges[b.dataset.badge]; b.hidden = !v; b.textContent = v || ''; });
      var ind = nav.querySelector('.ind');
      requestAnimationFrame(function () {
        if (!on || !on.offsetWidth) { ind.style.width = '0'; return; }
        ind.style.width = on.offsetWidth + 'px'; ind.style.transform = 'translateX(' + on.offsetLeft + 'px)';
      });
    });
  }
  addEventListener('resize', function () { if (me) setTabs(currentTab); });
  var currentTab = null;

  function accountSheet() {
    var t = store('rt-portal-theme') || 'system', idx = { system: 0, light: 1, dark: 2 }[t] || 0;
    sheet(
      '<div class="row"><span class="avatar lg ' + (me.role === 'admin' ? '' : 'warm') + '">' + initials(me.name) + '</span><div><h3>' + esc(me.name) + '</h3><p class="small muted">' + esc(me.email) + '</p>' + (me.college ? '<p class="small muted">' + esc(me.college) + '</p>' : '') + '</div></div>' +
      '<div class="field"><span class="small muted">Appearance</span><div class="seg" id="theme-seg" style="--n:3;--i:' + idx + '"><button type="button" data-v="system">System</button><button type="button" data-v="light">Light</button><button type="button" data-v="dark">Dark</button></div></div>' +
      (me.role === 'member' && can('chat') ? '<button class="btn btn-primary btn-block" type="button" id="to-chat">' + ic('msgs') + 'Message your mentor</button>' : '') +
      (isOwner() ? '<button class="btn btn-glass btn-block" type="button" id="team-btn">Team & permissions</button><button class="btn btn-glass btn-block" type="button" id="lessons-btn">Lessons</button>' : '') +
      (me.role === 'admin' ? '<button class="btn btn-glass btn-block" type="button" id="apps">Connected apps</button>' : '') +
      '<button class="btn btn-glass btn-block" type="button" id="tour-btn">' + ic('sparkle') + 'How Researchette works</button>' +
      '<button class="btn btn-glass btn-block" type="button" id="chpw">Change password</button>' +
      '<button class="btn btn-glass btn-block" type="button" id="logout">Log out</button>' +
      (S.demo && me.role === 'admin' ? '<button class="btn btn-quiet btn-block btn-sm" type="button" id="reset">Reset demo data</button>' : '') +
      '<button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Close</button>',
      function (el, close) {
        var seg = el.querySelector('#theme-seg');
        seg.querySelectorAll('button').forEach(function (b, i) {
          b.classList.toggle('on', i === idx);
          b.addEventListener('click', function () {
            seg.style.setProperty('--i', i); seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
            store('rt-portal-theme', b.dataset.v === 'system' ? null : b.dataset.v); applyTheme();
          });
        });
        el.querySelector('#chpw').addEventListener('click', function () { close(); passwordSheet(); });
        el.querySelector('#tour-btn').addEventListener('click', function () { close(); setTimeout(function () { tour(false); }, 300); });
        var tc = el.querySelector('#to-chat'); if (tc) tc.addEventListener('click', function () { close(); go('chat'); });
        var ap = el.querySelector('#apps'); if (ap) ap.addEventListener('click', function () { close(); appsSheet(); });
        var tb = el.querySelector('#team-btn'); if (tb) tb.addEventListener('click', function () { close(); go('team'); });
        var lb = el.querySelector('#lessons-btn'); if (lb) lb.addEventListener('click', function () { close(); go('lessons'); });
        el.querySelector('#logout').addEventListener('click', function () { S.signOut().then(function () { forgetMe(); close(); app.dataset.shell = ''; go('login'); }); });
        var rs = el.querySelector('#reset');
        if (rs) rs.addEventListener('click', function () {
          if (rs.dataset.armed) { S.reset().then(function () { close(); app.dataset.shell = ''; toast('Demo data reset'); go('login'); }); return; }
          rs.dataset.armed = '1'; rs.textContent = 'Tap again to reset all demo data';
        });
      });
  }

  /* AI apps connected through the MCP connector (Claude, Gemini, ChatGPT…) */
  function appsSheet() {
    var url = location.origin + '/mcp';
    S.connections().then(function (list) {
      sheet('<h2>Connected apps</h2><p class="muted">AI assistants you’ve connected can manage Researchette as you. To connect one, add a custom connector with this address, then log in and tap Allow.</p>' +
        '<div class="cred"><span>Connector address</span><b id="mcp-url">' + esc(url) + '</b></div><button class="btn btn-glass btn-block btn-sm" type="button" id="cp-url">Copy address</button>' +
        (list.length ? '<div class="list">' + list.map(function (c) {
          return '<div class="li app"><div class="li-main"><span class="li-title">' + esc(c.name) + '</span><span class="li-sub">Connected ' + rel(c.since) + ' · active ' + rel(c.lastUsed) + '</span></div><button class="btn btn-danger btn-sm" type="button" data-cid="' + esc(c.clientId) + '">Disconnect</button></div>';
        }).join('') + '</div>' : '<p class="small muted">No apps connected yet.</p>') +
        '<p class="small muted">Changing your password disconnects every app.</p><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Close</button>',
        function (el, close) {
          el.querySelector('#cp-url').addEventListener('click', function () { copy(url, el.querySelector('#mcp-url')); });
          el.querySelectorAll('[data-cid]').forEach(function (b) {
            b.addEventListener('click', function () { S.disconnect(b.dataset.cid).then(function () { close(); toast('App disconnected'); appsSheet(); }, function (e) { toast(e.message); }); });
          });
        });
    }, function (e) { toast(e.message); });
  }

  function passwordSheet() {
    var field = function (id, label, ac) { return '<div class="field"><label for="' + id + '">' + label + '</label><div class="pw"><input id="' + id + '" type="password" autocomplete="' + ac + '"><button type="button" data-show="' + id + '">Show</button></div></div>'; };
    sheet(
      '<h2>Change password</h2><p class="muted small">Use at least 8 characters. You’ll stay logged in on this device.</p>' +
      '<form id="pwform" class="stack" novalidate>' +
        field('pw-cur', 'Current password', 'current-password') + field('pw-new', 'New password', 'new-password') + field('pw-rep', 'Repeat new password', 'new-password') +
        '<p class="error" id="pw-err" role="alert" hidden></p>' +
        '<button class="btn btn-primary btn-block" type="submit">Save new password</button>' +
        '<button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Cancel</button>' +
      '</form>',
      function (el, close) {
        el.querySelectorAll('[data-show]').forEach(function (b) {
          b.addEventListener('click', function () { var i = el.querySelector('#' + b.dataset.show), s = i.type === 'password'; i.type = s ? 'text' : 'password'; b.textContent = s ? 'Hide' : 'Show'; });
        });
        var f = el.querySelector('#pwform'), err = el.querySelector('#pw-err');
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var cur = f.querySelector('#pw-cur').value, nw = f.querySelector('#pw-new').value, rep = f.querySelector('#pw-rep').value;
          var show = function (m) { err.textContent = m; err.hidden = false; };
          if (!cur || !nw) return show('Fill in your current and new password.');
          if (nw !== rep) return show('The new passwords don’t match.');
          S.changePassword(me.id, cur, nw).then(function () { close(); toast('Password changed'); }, function (x) { show(x.message); });
        });
      });
  }

  /* ---------- router ---------- */
  var busy = 0;
  async function render() {
    var token = ++busy;
    stopChat();
    if (meKnown) me = meCache; else { me = meCache = await S.me(); meKnown = true; }
    var r = (location.hash || '').slice(1);
    if (!me) { app.dataset.shell = ''; if (r !== 'login') setHash('login'); return loginView(); }
    if (r === 'login' || !r) { r = me.role === 'admin' ? 'overview' : 'today'; setHash(r); }
    await loadLessons();

    var view, tab, badges = null, statsP = null;
    if (me.role === 'member') statsP = S.unread().then(function (x) { return { unread: x.unread }; }, function () { return null; });
    if (me.role === 'admin') {
      statsP = S.stats(me.id).catch(function () { return null; });
      if ((r === 'applications' && !can('applications')) || ((r === 'messages' || /^chat-/.test(r)) && !can('chat')) || ((r === 'team' || /^admin-/.test(r) || r === 'lessons' || /^lesson-/.test(r)) && !isOwner())) { r = 'overview'; setHash(r); }
      var lm = /^lesson-([a-z]+)-(\d+)$/.exec(r);
      if (/^review-/.test(r)) { view = vReview(r.slice(7)); tab = 'reviews'; }
      else if (r === 'team') { view = vTeam(); tab = 'overview'; }
      else if (r === 'lessons') { view = vLessons(); tab = 'overview'; }
      else if (lm) { view = vLesson(lm[1], +lm[2]); tab = 'overview'; }
      else if (/^admin-/.test(r)) { view = vTeamMember(r.slice(6)); tab = 'overview'; }
      else if (/^member-/.test(r)) { view = vMember(r.slice(7)); tab = 'members'; }
      else if (/^chat-/.test(r)) { view = vMentorChat(r.slice(5)); tab = 'messages'; }
      else if (r === 'messages') { view = vMessages(); tab = r; }
      else if (r === 'reviews') { view = vReviews(); tab = r; }
      else if (r === 'members') { view = vMembers(); tab = r; }
      else if (r === 'applications') { view = vApplications(); tab = r; }
      else { view = statsP.then(function (st) { return vOverview(st || {}); }); tab = 'overview'; if (r !== 'overview') setHash('overview'); }
    } else {
      var sm = /^step-([a-z]+)-(\d+)$/.exec(r);
      if (sm) { view = vStep(sm[1], +sm[2]); tab = 'roadmap'; }
      else if (r === 'roadmap') { view = vRoadmap(); tab = r; }
      else if (r === 'feedback') { view = vFeedback(); tab = r; }
      else if (r === 'chat' && can('chat')) { view = vMemberChat(); tab = r; }
      else { view = vToday(); tab = 'today'; if (r !== 'today') setHash('today'); }
    }
    /* instant feedback: highlight the tab and dim the page while the next one loads */
    var mainNow = document.getElementById('view');
    if (mainNow && app.dataset.shell === shellKey()) { setTabs(tab, lastBadges); mainNow.classList.add('is-loading'); }
    var v;
    try { v = await view; if (statsP) badges = lastBadges = await statsP; } catch (e) {
      if (/log in/i.test(e.message)) { forgetMe(); app.dataset.shell = ''; setHash('login'); return render(); }
      v = { html: '<div class="glass empty">' + ic('alert') + '<b>Couldn’t load this page</b><span>' + esc(e.message) + '</span><button class="btn btn-glass btn-sm" type="button" id="retry">Try again</button></div>',
        mount: function (m) { m.querySelector('#retry').addEventListener('click', render); } };
    }
    if (token !== busy) return;
    ensureShell();
    currentTab = tab; setTabs(tab, badges);
    var main = document.getElementById('view');
    main.classList.remove('is-loading');
    main.innerHTML = v.html;
    main.classList.remove('view-enter'); void main.offsetWidth; main.classList.add('view-enter');
    scrollTo({ top: 0, behavior: 'instant' });
    if (v.mount) v.mount(main);
    placeInstall();
    if (me.welcome && !tourShown) { tourShown = true; setTimeout(function () { tour(true); }, 450); }
  }
  addEventListener('hashchange', render);
  /* keep the unread badges fresh while the portal is open */
  setInterval(function () {
    if (!me || document.hidden || app.dataset.shell !== shellKey()) return;
    (me.role === 'admin' ? S.adminUnread() : S.unread()).then(function (x) {
      lastBadges = Object.assign({}, lastBadges, me.role === 'admin' ? { unreadChats: x.unread } : { unread: x.unread });
      setTabs(currentTab, lastBadges);
    }, function () {});
  }, 30000);
  var meCache = null, meKnown = false, lastBadges = null, tourShown = false;
  function forgetMe() { meCache = null; meKnown = false; }
  // coming back to the portal re-checks the account on the next screen, so permission changes show up
  // without a reload (and without redrawing the page, which would lose anything half-typed)
  document.addEventListener('visibilitychange', function () { if (!document.hidden && me) meKnown = false; });
  function rememberMe(u) { meCache = u; meKnown = true; }

  /* ---------- login ---------- */
  function loginView() {
    app.innerHTML =
      '<div class="login-wrap"><form class="login glass" id="login" novalidate>' +
        '<a class="logo" href="index.html">' + LOGO + '<span>research<i>ette</i></span></a>' +
        '<div class="stack" style="gap:6px"><h1>Welcome back.</h1><p class="muted">Log in to your Researchette portal.</p></div>' +
        '<div class="field"><label for="l-email">Email</label><input id="l-email" type="email" autocomplete="username" required placeholder="you@example.com"></div>' +
        '<div class="field"><label for="l-pw">Password</label><div class="pw"><input id="l-pw" type="password" autocomplete="current-password" required placeholder="Your password"><button type="button" id="l-show">Show</button></div></div>' +
        '<p class="error" id="l-err" role="alert" hidden></p>' +
        '<button class="btn btn-primary btn-block" type="submit">Log in</button>' +
        '<p class="small muted">Forgot your password? Email <a href="mailto:itszainr1@gmail.com">itszainr1@gmail.com</a> and we’ll reset it.</p>' +
        '<p class="small">Not a member yet? <a href="index.html#join">Apply for membership</a></p>' +
        '<p class="small muted legal-links"><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></p>' +
      '</form></div>';
    var f = document.getElementById('login'), err = document.getElementById('l-err'), pw = document.getElementById('l-pw');
    document.getElementById('l-show').addEventListener('click', function () { var s = pw.type === 'password'; pw.type = s ? 'text' : 'password'; this.textContent = s ? 'Hide' : 'Show'; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = f.querySelector('#l-email').value, btn = f.querySelector('[type=submit]');
      if (!email.trim() || !pw.value) { err.textContent = 'Enter your email and password.'; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'Logging in…';
      S.signIn(email, pw.value).then(function (u) {
        if (u.twoFactor) return twoStepView(u);
        rememberMe(u); go(u.role === 'admin' ? 'overview' : 'today');
      }, function (x) {
        err.textContent = x.message; err.hidden = false; btn.disabled = false; btn.textContent = 'Log in';
      });
    });
  }

  /* ---------- welcome tour ----------
     Shown the first time someone opens the portal (remembered on the server), and any time from
     the account menu. Friendly, short slides; swipe or tap Next. */
  function tourSlides() {
    var fn = first(me.name);
    // everyone starts with a temporary password from their welcome message, so this comes first
    var pwSlide = { icon: 'lock', tone: 'amber', hand: 'takes 30 seconds', title: 'First, make your own password', action: 'password',
      text: 'Your login came with a <b>temporary password</b>. Swap it for one only you know:',
      steps: ['Tap your initials <b class="tour-initials' + (me.role === 'admin' ? ' admin' : '') + '">' + initials(me.name) + '</b> at the top right.', 'Tap <b>Change password</b>.', 'Type the temporary password as <b>Current password</b>, then your new one twice (at least 8 characters).'] };
    if (me.role === 'member') return [
      { icon: 'sparkle', tone: 'pen', hand: 'so glad you’re here!', title: 'Welcome, ' + fn + '!', text: 'This is your research home. Together we’ll go from an idea in your head to a published paper, one small step at a time. No rush, no stress.' },
      pwSlide,
      { icon: 'today', tone: 'teal', hand: 'one cup of chai', title: 'One small task a day', text: 'Open <b>Today</b> and your step is waiting: a short lesson, an example and a task. Most take 20 to 40 minutes.' },
      { icon: 'pen', tone: 'amber', hand: 'drafts save by themselves', title: 'Learn, peek, write', text: 'Read <b>Learn</b>, peek at the <b>Example</b> to see what good looks like, then write your answer in <b>Task</b>. Stop any time; your draft is kept.' },
      { icon: 'send', tone: 'pen', hand: 'you’re never on your own', title: 'Your mentor reads it all', text: 'Tap <b>Send to mentor</b>. You’ll hear back within about 48 hours. <b>Approved</b>? The next step unlocks. <b>Needs changes</b>? Totally normal. Every researcher rewrites. Fix it and send again.' },
      can('chat') ? { icon: 'msgs', tone: 'teal', hand: 'no silly questions', title: 'Stuck? Just ask', text: 'Tap <b>Chat</b>, or <b>Ask your mentor</b> under today’s task. Your mentor sees which step you’re on.' } : null,
      { icon: 'map', tone: 'amber', hand: 'watch it fill up', title: 'See how far you’ve come', text: '<b>Roadmap</b> shows every step, and <b>Feedback</b> keeps all your mentor’s comments in one place.' },
      { icon: 'phone', tone: 'pen', hand: 'one tap away', title: 'Keep it on your phone', text: 'Add Researchette to your home screen and it opens like an app. On iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.', last: 'Let’s begin' }
    ].filter(Boolean);
    return [
      { icon: 'sparkle', tone: 'pen', hand: 'welcome aboard!', title: 'Hi, ' + fn + '!', text: 'This is your mentor desk. Here’s a 30-second tour of where everything lives.' },
      pwSlide,
      can('review') ? { icon: 'inbox', tone: 'teal', hand: 'oldest first', title: 'Reviews', text: 'Your students’ submissions land in <b>Reviews</b>. Read, write kind and clear feedback, then <b>Approve</b> (the next step unlocks) or <b>Request changes</b>. Try to reply within 48 hours.' } : null,
      can('chat') ? { icon: 'msgs', tone: 'amber', hand: 'the badge shows what’s new', title: 'Messages', text: 'Questions from your students arrive in <b>Messages</b>. After a review you can also let them know on WhatsApp in one tap.' } : null,
      { icon: 'users', tone: 'pen', hand: 'everything in one place', title: seesAll() ? 'Members' : 'Your students', text: 'Open a student to see every step they’ve done, their feedback history, and buttons to chat or WhatsApp them.' },
      isOwner() ? { icon: 'lock', tone: 'teal', hand: 'you’re in charge', title: 'Team & permissions', text: 'As an owner, open <b>Team & permissions</b> from Overview to add mentors, choose what each mentor and student can do, and see everyone’s activity.' } : null,
      { icon: 'phone', tone: 'amber', hand: 'one tap away', title: 'Keep it on your phone', text: 'Add Researchette to your home screen for quick reviews on the go. On iPhone: <b>Share</b>, then <b>Add to Home Screen</b>.', last: 'Let’s go' }
    ].filter(Boolean);
  }
  function tour(isFirst) {
    var slides = tourSlides(), at = 0;
    if (isFirst) { me.welcome = false; if (meCache) meCache.welcome = false; S.welcomed().catch(function () {}); }
    sheet('<div class="tour" id="tour" aria-roledescription="carousel">' +
        '<div class="tour-stage" id="tour-stage" aria-live="polite"></div>' +
        '<div class="tour-dots" role="tablist">' + slides.map(function (x, i) { return '<button type="button" role="tab" data-i="' + i + '" aria-label="Slide ' + (i + 1) + ' of ' + slides.length + '"></button>'; }).join('') + '</div>' +
        '<div class="tour-nav"><button class="btn btn-quiet" type="button" id="tour-prev">Back</button><button class="btn btn-primary" type="button" id="tour-next">Next</button></div>' +
        '<button class="btn btn-quiet btn-sm tour-skip" type="button" data-close>Skip the tour</button>' +
      '</div>',
      function (el, close) {
        var stage = el.querySelector('#tour-stage'), prev = el.querySelector('#tour-prev'), next = el.querySelector('#tour-next'), skip = el.querySelector('.tour-skip');
        function show(i, dir) {
          at = Math.max(0, Math.min(slides.length - 1, i));
          var x = slides[at], lastOne = at === slides.length - 1;
          stage.innerHTML = '<div class="tour-slide ' + (dir < 0 ? 'from-left' : 'from-right') + '">' +
            '<div class="tour-art ' + x.tone + '">' + ic(x.icon) + '<i class="d1"></i><i class="d2"></i><i class="d3"></i></div>' +
            '<span class="hand">' + x.hand + '</span><h2>' + x.title + '</h2><p>' + x.text + '</p>' +
            (x.steps ? '<ol class="tour-steps">' + x.steps.map(function (st) { return '<li>' + st + '</li>'; }).join('') + '</ol>' : '') +
            (x.action === 'password' ? '<button class="btn btn-glass btn-sm" type="button" id="tour-pw">' + ic('lock') + 'Change it now</button><span class="small muted">or do it later, any time</span>' : '') +
            '</div>';
          var pwb = stage.querySelector('#tour-pw');
          if (pwb) pwb.addEventListener('click', function () { close(); setTimeout(passwordSheet, 350); });
          el.querySelectorAll('.tour-dots button').forEach(function (d, j) { d.classList.toggle('on', j === at); d.setAttribute('aria-selected', j === at); });
          prev.style.visibility = at ? 'visible' : 'hidden';
          next.textContent = lastOne ? (x.last || 'Done') : 'Next';
          skip.hidden = lastOne;
        }
        next.addEventListener('click', function () { if (at === slides.length - 1) close(); else show(at + 1, 1); });
        prev.addEventListener('click', function () { show(at - 1, -1); });
        el.querySelectorAll('.tour-dots button').forEach(function (d) { d.addEventListener('click', function () { var i = +d.dataset.i; show(i, i < at ? -1 : 1); }); });
        el.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(at + 1, 1); if (e.key === 'ArrowLeft') show(at - 1, -1); });
        // swipe left and right between slides
        var x0 = null, y0 = 0;
        stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
        stage.addEventListener('pointerup', function (e) {
          if (x0 === null) return;
          var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        });
        show(0, 1);
        next.focus({ preventScroll: true });
      });
  }

  /* ---------- two-step verification (owners, on a new device) ---------- */
  function loadQr(cb) {
    if (window.qrcode) return cb();
    var sc = document.createElement('script'); sc.src = 'assets/qrcode.js'; sc.onload = cb; document.head.appendChild(sc);
  }
  function twoStepView(t) {
    var setup = t.twoFactor === 'setup', recovery = false;
    app.dataset.shell = '';
    app.innerHTML = '<div class="login-wrap"><form class="login glass two-step" id="ts" novalidate>' +
      '<a class="logo" href="index.html">' + LOGO + '<span>research<i>ette</i></span></a>' +
      (setup
        ? '<div class="stack" style="gap:6px"><span class="eyebrow">One-time setup</span><h1>Protect your account</h1><p class="muted">As an owner, you’ll confirm each new device with a code from Passwords on your iPhone. It takes a minute.</p></div>' +
          '<ol class="ts-steps"><li>On your iPhone, open the <b>Camera</b> and point it at this QR code, then tap <b>Add Verification Code in Passwords</b>.</li>' +
            '<li>Enter the 6-digit code Passwords now shows for Researchette.</li></ol>' +
          '<div class="qr" id="qr" role="img" aria-label="QR code for your authenticator"></div>' +
          '<p class="small muted ts-alt">Using this iPhone? <a href="' + esc(t.otpauth) + '">Add to Passwords</a>. Or add a code manually in Passwords → Codes → + with this setup key:</p>' +
          '<div class="cred"><span>Setup key</span><b id="ts-key">' + esc(t.secret) + '</b></div>'
        : '<div class="stack" style="gap:6px"><span class="eyebrow">New device</span><h1>Enter your code</h1><p class="muted">Open <b>Passwords</b> on your iPhone, go to <b>Codes</b>, and enter the 6-digit code for Researchette.</p></div>') +
      '<div class="field"><label for="ts-code" id="ts-label">6-digit code</label><input id="ts-code" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="123456" autofocus></div>' +
      '<p class="error" id="ts-err" role="alert" hidden></p>' +
      '<button class="btn btn-primary btn-block" type="submit">' + (setup ? 'Turn on and continue' : 'Continue') + '</button>' +
      (setup ? '' : '<button class="btn btn-quiet btn-block btn-sm" type="button" id="ts-rc">Lost your phone? Use a recovery code</button>') +
      '<button class="btn btn-quiet btn-block btn-sm" type="button" id="ts-back">Back to log in</button>' +
      '<p class="small muted">This device will be remembered for 30 days.</p>' +
    '</form></div>';
    var f = document.getElementById('ts'), inp = document.getElementById('ts-code'), err = document.getElementById('ts-err'), btn = f.querySelector('[type=submit]');
    if (setup) loadQr(function () {
      var qr = qrcode(0, 'M'); qr.addData(t.otpauth); qr.make();
      document.getElementById('qr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    });
    var rc = document.getElementById('ts-rc');
    if (rc) rc.addEventListener('click', function () {
      recovery = true; rc.hidden = true;
      document.getElementById('ts-label').textContent = 'Recovery code';
      inp.value = ''; inp.setAttribute('inputmode', 'text'); inp.setAttribute('autocomplete', 'off'); inp.maxLength = 11; inp.placeholder = 'xxxxx-xxxxx'; inp.focus();
    });
    document.getElementById('ts-back').addEventListener('click', function () { loginView(); });
    // codes filled in by Passwords (or typed) are sent as soon as all six digits are there
    inp.addEventListener('input', function () { if (!recovery && inp.value.replace(/\D/g, '').length === 6) f.requestSubmit(); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = inp.value.trim();
      if (!code) { err.textContent = recovery ? 'Enter one of your recovery codes.' : 'Enter the 6-digit code.'; err.hidden = false; return; }
      if (btn.disabled) return;
      btn.disabled = true; err.hidden = true;
      S.verifyLogin(t.ticket, code).then(function (u) {
        var codes = u.recoveryCodes, used = u.recoveryUsed, left = u.recoveryLeft;
        delete u.recoveryCodes; delete u.recoveryUsed; delete u.recoveryLeft;
        rememberMe(u);
        if (codes) return recoveryCodesView(codes);
        if (used) toast('Recovery code used. ' + left + ' left.');
        go(u.role === 'admin' ? 'overview' : 'today');
      }, function (x) {
        btn.disabled = false; err.textContent = x.message; err.hidden = false; inp.select();
        if (/expired/i.test(x.message)) setTimeout(loginView, 1800);
      });
    });
  }
  function recoveryCodesView(codes) {
    var text = 'Researchette recovery codes (each works once)\n' + codes.join('\n');
    app.innerHTML = '<div class="login-wrap"><div class="login glass two-step">' +
      '<a class="logo" href="index.html">' + LOGO + '<span>research<i>ette</i></span></a>' +
      '<div class="stack" style="gap:6px"><span class="stamp">Two-step is on</span><h1>Save your recovery codes</h1><p class="muted">If you lose your iPhone, each of these lets you in once. Save them somewhere safe, like a note in Passwords. You won’t see them again.</p></div>' +
      '<ol class="rc-list" id="rc-list">' + codes.map(function (c) { return '<li><code>' + esc(c) + '</code></li>'; }).join('') + '</ol>' +
      '<button class="btn btn-glass btn-block" type="button" id="rc-copy">Copy codes</button>' +
      '<button class="btn btn-primary btn-block" type="button" id="rc-done">I’ve saved them</button>' +
      '<p class="small muted">If you lose both, Taimoor or Zain can reset your two-step verification from Team & permissions.</p>' +
    '</div></div>';
    document.getElementById('rc-copy').addEventListener('click', function () { copy(text, document.getElementById('rc-list')); });
    document.getElementById('rc-done').addEventListener('click', function () { go('overview'); });
  }

  /* ---------- member: today ---------- */
  function ring(done, total) {
    var c = 2 * Math.PI * 32, off = c * (1 - done / total);
    return '<div class="ring"><svg viewBox="0 0 76 76" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B9E8C"/><stop offset="1" stop-color="#3448D8"/></linearGradient></defs>' +
      '<circle class="track" cx="38" cy="38" r="32"/><circle class="fill" cx="38" cy="38" r="32" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (reduce ? off : c).toFixed(1) + '" data-off="' + off.toFixed(1) + '"/></svg><b>' + done + '/' + total + '</b></div>';
  }
  function animateRing(root) { var f = root.querySelector('.ring .fill'); if (f) requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.strokeDashoffset = f.dataset.off; }); }); }
  function progSwitch(t) {
    return '<button class="prog-switch glass" type="button" data-prog><span class="small muted">Programme</span><b>' + esc(T(t).name) + '</b>' + ic('chev', 'chev down') + '</button>';
  }
  function bindProg(root) { root.querySelectorAll('[data-prog]').forEach(function (b) { b.addEventListener('click', programmeSheet); }); }

  /* members choose (or start) a programme; mentors can also assign them */
  async function programmeSheet() {
    var prog = await S.progress(me.id);
    sheet('<h2>Choose a programme</h2><p class="muted small">Each programme has its own step-by-step roadmap. Your progress in each one is saved.</p>' +
      (can('choose_programme') ? '' : '<p class="small muted">Your mentor chooses which programmes you can follow.</p>') +
      '<div class="glass list">' + C.tracks.filter(function (t) { return can('choose_programme') || (me.tracks || []).indexOf(t.id) > -1; }).map(function (t) {
        var p = prog[t.id], on = t.id === me.activeTrack;
        var sub = p ? p.done + ' of ' + p.total + ' steps approved' : t.steps.length + ' steps · not started';
        return '<button class="li li-btn" type="button" data-t="' + t.id + '"><span class="sicon ' + (on ? 'current' : p ? 'approved' : 'locked') + '">' + (on ? ic('check') : t.steps.length) + '</span>' +
          '<div class="li-main"><span class="li-title">' + esc(t.name) + '</span><span class="li-sub">' + esc(sub) + '</span></div>' +
          '<div class="li-end">' + (on ? '<span class="pill approved">Current</span>' : '<span class="pill">' + (p ? 'Switch' : 'Start') + '</span>') + '</div></button>';
      }).join('') + '</div><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Close</button>',
      function (el, close) {
        el.querySelectorAll('[data-t]').forEach(function (b) {
          b.addEventListener('click', function () {
            var id = b.dataset.t;
            if (id === me.activeTrack) { close(); return; }
            S.setActiveTrack(me.id, id).then(function (u) { rememberMe(u); close(); toast('Now on: ' + T(id).name); go('today'); });
          });
        });
      });
  }

  async function vToday() {
    var t = me.activeTrack || 'original', tr = T(t);
    var st = await S.stepStates(me.id, t), total = st.length;
    var done = st.filter(function (x) { return x.status === 'approved'; }).length;
    var cur = st.filter(function (x) { return x.status !== 'approved'; })[0];
    var head = '<section class="page-head"><span class="eyebrow">' + today() + '</span><h1>' + greet() + ', ' + first(me.name) + '.</h1></section>' + progSwitch(t);
    if (!cur) {
      return { html: head + '<div class="glass card locked-box">' + ring(total, total) + '<span class="stamp">Programme complete!</span><h2>You’ve finished all ' + total + ' steps of ' + esc(tr.name) + '.</h2><p class="muted">Your mentor will help you with the final submission. Ready for the next one?</p><button class="btn btn-primary" type="button" data-prog>Choose another programme</button></div>',
        mount: function (m) { animateRing(m); bindProg(m); } };
    }
    var d = stepOf(t, cur.step);
    var summary = '<div class="glass card today-head">' + ring(done, total) + '<div class="txt"><span class="small muted">' + esc(tr.name) + '</span><h3>' + done + ' of ' + total + ' steps approved</h3><span class="small muted">Today: Step ' + cur.step + ' · ' + esc(d.title) + '</span></div></div>';
    var body = stepCard(t, cur.step, st);
    var help = can('chat') ? '<div class="glass card help-card"><div><h3>Stuck on this step?</h3><p class="small muted">Ask your mentor in the chat. They’ll see which step you’re on.</p></div>' +
      '<button class="btn btn-primary" type="button" id="ask">' + ic('msgs') + 'Ask your mentor</button></div>' : '';
    return { html: head + summary + body.html + help, mount: function (m) {
      animateRing(m); bindProg(m); body.mount(m);
      var ask = m.querySelector('#ask'); if (ask) ask.addEventListener('click', function () { chatContext = tr.name + ' · Step ' + cur.step + ': ' + d.title; go('chat'); });
    } };
  }

  async function vStep(t, n) {
    if (!C.tracks.some(function (x) { return x.id === t; }) || !(n >= 1 && n <= T(t).steps.length)) { setHash('roadmap'); return vRoadmap(); }
    var st = await S.stepStates(me.id, t), body = stepCard(t, n, st);
    return { html: '<a class="back" href="#roadmap">' + ic('back', 'chev') + 'Roadmap</a>' + body.html, mount: body.mount };
  }

  /* charts and diagrams inside lessons */
  function visual(v) {
    var body = '';
    if (v.type === 'table') {
      body = '<div class="viz-scroll"><table class="viz-table' + (v.head.length > 2 ? ' cards' : '') + '"><thead><tr>' + v.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        v.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td data-label="' + esc(v.head[i]) + '">' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    } else if (v.type === 'flow') {
      body = '<ol class="viz-flow">' + v.steps.map(function (x, i) { return '<li><span class="n">' + (i + 1) + '</span><div><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div></li>'; }).join('') + '</ol>';
    } else if (v.type === 'choose') {
      body = '<div class="viz-choose">' + v.items.map(function (x) {
        return '<div class="row-c"><span class="if">' + esc(x[0]) + '</span><span class="arrow" aria-hidden="true">→</span><span class="then"><b>' + esc(x[1]) + '</b>' + (x[2] ? '<small>' + esc(x[2]) + '</small>' : '') + '</span></div>';
      }).join('') + '</div>';
    } else if (v.type === 'pyramid') {
      var n = v.levels.length;
      body = '<div class="viz-pyramid">' + v.levels.map(function (l, i) {
        return '<div class="lvl" style="--w:' + Math.round(56 + (44 * i) / Math.max(1, n - 1)) + '%;--k:' + (i / Math.max(1, n - 1)).toFixed(2) + '"><span>' + esc(l) + '</span></div>';
      }).join('') + '<div class="pyr-legend"><span>Strongest evidence</span><span>Weakest</span></div></div>';
    } else if (v.type === 'formula') {
      body = '<div class="viz-formula"><div class="expr">' + esc(v.expr) + '</div><dl>' + v.legend.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' +
        (v.worked ? '<p class="worked"><b>Worked example:</b> ' + esc(v.worked) + '</p>' : '') + '</div>';
    }
    return '<figure class="viz"><figcaption>' + esc(v.title) + '</figcaption>' + body + '</figure>';
  }

  function stepCard(t, n, st, preview) {
    var x = st[n - 1], d = stepOf(t, n), ph = phaseOf(t, n), sub = x.submission, total = st.length;
    if (x.status === 'locked') {
      var open = st.filter(function (s) { return s.status !== 'approved'; })[0];
      return { html: '<div class="glass card locked-box">' + ic('lock') + '<h2>Step ' + n + ' · ' + esc(d.title) + '</h2><p class="muted">This step unlocks when step ' + (n - 1) + ' is approved.</p><a class="btn btn-glass" href="#step-' + t + '-' + open.step + '">Go to step ' + open.step + '</a></div>', mount: function () {} };
    }
    var tab = x.status === 'current' ? 0 : 2;
    var html = '<article class="glass card stack-lg" id="stepcard">' +
      '<div class="step-head"><div class="row spread wrap"><span class="eyebrow">' + esc(T(t).short) + ' · ' + esc(ph.name) + '</span>' + pill(x.status) + '</div>' +
      '<h2>Step ' + n + ' · ' + esc(d.title) + '</h2><div class="step-meta">' + ic('clock', 'chev') + d.minutes + ' min · ' + esc(d.summary) + '</div></div>' +
      '<div class="seg" role="tablist" style="--n:3;--i:' + tab + '"><button type="button" role="tab" data-t="0">Learn</button><button type="button" role="tab" data-t="1">Example</button><button type="button" role="tab" data-t="2">Task</button></div>' +
      '<div id="panel"></div></article>';

    function panel(k) {
      if (k === 0) return '<div class="panel stack-lg">' +
        (d.intro ? '<div class="note simple"><span class="eyebrow">In simple words</span><p>' + esc(d.intro) + '</p></div>' : '') +
        (d.visuals || []).map(visual).join('') +
        '<div class="stack"><span class="eyebrow">Step by step</span><ol class="lesson">' + d.lesson.map(function (l, i) {
          return '<li><span class="n">' + (i + 1) + '</span><div><b>' + esc(l.h) + '</b><p>' + esc(l.p) + '</p></div></li>';
        }).join('') + '</ol></div>' +
        (d.mistakes ? '<div class="note mistakes"><span class="eyebrow">Common mistakes to avoid</span><ul>' + d.mistakes.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>' : '') +
        '<button class="btn btn-glass" type="button" data-goto="1">See an example →</button></div>';
      if (k === 1) return '<div class="panel ex">' +
        '<div class="ex-box ex-weak"><span class="lbl">Weak</span><p>' + esc(d.example.weak) + '</p></div>' +
        '<div class="ex-box ex-strong"><span class="lbl">Strong</span><p>' + esc(d.example.strong) + '</p></div>' +
        '<p class="why"><b>Why it works:</b> ' + esc(d.example.why) + '</p>' +
        ((x.status === 'current' || x.status === 'revision') ? '<button class="btn btn-primary" type="button" data-goto="2">' + (preview ? 'See the task →' : 'Start the task →') + '</button>' : '') + '</div>';
      var by = function (s) { return s && s.reviewer ? '<div class="by"><span class="avatar">' + initials(s.reviewer.name) + '</span>' + esc(s.reviewer.name) + ' · ' + rel(s.reviewedAt) + '</div>' : ''; };
      var out = '<div class="panel stack"><span class="eyebrow">Your task</span><p class="prompt">' + esc(d.task.prompt) + '</p>' +
        (d.include ? '<div class="include"><b class="small">What to include</b><ul>' + d.include.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '');
      if (preview) return out + (d.template ? '<div class="stack"><span class="eyebrow">Template students can start from</span><div class="paper">' + esc(d.template) + '</div></div>' : '') +
        '<p class="small muted">Students write their answer here and submit it for review.</p></div>';
      if (x.status === 'revision') out += '<div class="note red"><span class="small"><b>Your mentor asked for changes</b></span><p class="fb">' + esc(sub.feedback) + '</p>' + by(sub) + '</div>';
      if (x.status === 'current' || x.status === 'revision') {
        out += '<div class="field"><div class="row spread wrap"><label for="answer">Your answer</label>' + (d.template ? '<button class="btn btn-quiet btn-sm" type="button" id="use-tpl">Use a template</button>' : '') + '</div><textarea id="answer" placeholder="Write your answer here. Your draft saves automatically."></textarea></div>' +
          '<div class="row spread wrap"><span class="counter" id="counter"></span><button class="btn btn-primary" type="button" id="send" disabled>' + (x.status === 'revision' ? 'Resubmit' : 'Submit for review') + '</button></div>';
      }
      if (x.status === 'review') out += '<div class="note amber"><b class="small">Submitted ' + rel(sub.createdAt) + '</b><span class="small muted">Your mentor will review it within 48 hours. You’ll see their feedback here.</span></div><div class="paper">' + esc(sub.text) + '</div>';
      if (x.status === 'approved') out += '<div><span class="stamp">Approved</span></div>' + (sub.feedback ? '<div class="note teal"><p class="fb">' + esc(sub.feedback) + '</p>' + by(sub) + '</div>' : '') +
        '<details><summary class="small muted" style="cursor:pointer">Your approved answer</summary><div class="paper" style="margin-top:10px">' + esc(sub.text) + '</div></details>' +
        (n < total ? '<a class="btn btn-primary" href="#step-' + t + '-' + (n + 1) + '">Go to step ' + (n + 1) + ' →</a>' : '');
      return out + '</div>';
    }

    function mount(root) {
      var card = root.querySelector('#stepcard'), seg = card.querySelector('.seg'), box = card.querySelector('#panel');
      function show(k) {
        seg.style.setProperty('--i', k);
        seg.querySelectorAll('button').forEach(function (b) { var on = +b.dataset.t === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        box.innerHTML = panel(k);
        box.querySelectorAll('[data-goto]').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.goto); }); });
        var ta = box.querySelector('#answer');
        if (ta) {
          var key = 'rt-draft-' + me.id + '-' + t + '-' + n, cnt = box.querySelector('#counter'), send = box.querySelector('#send');
          ta.value = store(key) || (t === 'original' && store('rt-draft-' + me.id + '-' + n)) || (x.status === 'revision' ? sub.text : '');
          var upd = function () {
            var w = words(ta.value), ok = ta.value.trim().length > 0;
            cnt.textContent = w ? w + ' word' + (w === 1 ? '' : 's') : 'Draft saves automatically'; send.disabled = !ok;
          };
          var tpl = box.querySelector('#use-tpl');
          if (tpl) tpl.addEventListener('click', function () {
            if (ta.value.trim() && ta.value.trim() !== d.template.trim()) { ta.value = ta.value.replace(/\s*$/, '') + '\n\n' + d.template; } else ta.value = d.template;
            store(key, ta.value); upd(); ta.focus();
          });
          ta.addEventListener('input', function () { store(key, ta.value); upd(); }); upd();
          send.addEventListener('click', function () {
            send.disabled = true; send.textContent = 'Sending…';
            S.submit(me.id, t, n, ta.value.trim()).then(function () { store(key, null); toast('Sent to your mentor'); render(); }, function (e) { toast(e.message); send.disabled = false; });
          });
        }
      }
      seg.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.t); }); });
      show(tab);
    }
    return { html: html, mount: mount };
  }

  /* ---------- member: roadmap ---------- */
  function roadmapList(t, st, linkFn) {
    return T(t).phases.map(function (ph, pi) {
      var items = st.filter(function (x) { return stepOf(t, x.step).phase === ph.id; });
      var pd = items.filter(function (x) { return x.status === 'approved'; }).length;
      return '<section class="stack" style="gap:0"><div class="phase-title"><h3>Phase 0' + (pi + 1) + ' · ' + esc(ph.name) + '</h3><span class="small muted">' + pd + '/' + items.length + '</span></div><div class="glass list">' +
        items.map(function (x) {
          var d = stepOf(t, x.step), href = linkFn(x);
          var inner = sicon(x.status, x.step) + '<div class="li-main"><span class="li-title">' + x.step + '. ' + esc(d.title) + '</span><span class="li-sub">' + esc(d.summary) + ' · ' + d.minutes + ' min</span></div><div class="li-end">' + (x.status === 'locked' ? '' : pill(x.status) + (href ? ic('chev', 'chev') : '')) + '</div>';
          return href ? '<a class="li" href="' + href + '">' + inner + '</a>' : '<div class="li"' + (x.status === 'locked' ? ' aria-disabled="true"' : '') + '>' + inner + '</div>';
        }).join('') + '</div></section>';
    }).join('');
  }
  async function vRoadmap() {
    var t = me.activeTrack || 'original', st = await S.stepStates(me.id, t), total = st.length;
    var done = st.filter(function (x) { return x.status === 'approved'; }).length;
    var html = '<section class="page-head"><span class="eyebrow">Roadmap</span><h1>' + esc(T(t).name) + '</h1><div class="row"><div class="bar" style="flex:1"><i style="width:' + Math.round(done / total * 100) + '%"></i></div><span class="small muted">' + done + ' of ' + total + '</span></div></section>' +
      progSwitch(t) + roadmapList(t, st, function (x) { return x.status === 'locked' ? '' : '#step-' + t + '-' + x.step; });
    return { html: html, mount: bindProg };
  }

  /* ---------- member: feedback ---------- */
  async function vFeedback() {
    var subs = await S.submissions(me.id);
    var html = '<section class="page-head"><span class="eyebrow">History</span><h1>Feedback</h1><p class="muted">Everything you’ve submitted and what your mentors said.</p></section>';
    if (!subs.length) return { html: html + '<div class="glass empty">' + ic('chat') + '<b>No submissions yet</b><span>Your first task is waiting on the Today tab.</span></div>' };
    html += '<div class="glass list">' + subs.map(function (s) {
      var d = stepOf(s.track, s.step);
      var sub = s.feedback ? '“' + esc(s.feedback) + '”' : 'Waiting for your mentor';
      return '<a class="li" href="#step-' + s.track + '-' + s.step + '">' + sicon(s.status, s.step) + '<div class="li-main"><span class="li-title">' + esc(T(s.track).short) + ' · Step ' + s.step + ' · ' + esc(d.title) + '</span><span class="li-sub">' + sub + '</span></div><div class="li-end"><span class="small muted">' + rel(s.reviewedAt || s.createdAt) + '</span></div></a>';
    }).join('') + '</div>';
    return { html: html };
  }

  /* ---------- admin: overview ---------- */
  async function vOverview(stats) {
    var both = await Promise.all([S.queue(), can('applications') ? S.applications() : Promise.resolve([])]), q = both[0], apps = both[1].filter(function (a) { return a.status === 'new'; });
    var html = '<section class="page-head"><span class="eyebrow">' + today() + '</span><h1>' + greet() + ', ' + first(me.name) + '.</h1><p class="muted">' +
      (stats.pending ? stats.pending + ' submission' + (stats.pending > 1 ? 's are' : ' is') + ' waiting for review' + (stats.pendingMine ? ', ' + stats.pendingMine + ' from your students.' : '.') : 'You’re all caught up.') + '</p></section>' +
      '<div class="stats">' +
        '<a class="stat glass' + (stats.pending ? ' hot' : '') + '" href="#reviews"><b>' + stats.pending + '</b><span>Waiting for review</span></a>' +
        '<a class="stat glass" href="#members"><b>' + stats.myMembers + '</b><span>Your students</span></a>' +
        (can('applications') ? '<a class="stat glass" href="#applications"><b>' + stats.applications + '</b><span>New applications</span></a>' : '<a class="stat glass" href="#messages"><b>' + (stats.unreadChats || 0) + '</b><span>Unread messages</span></a>') +
        '<div class="stat glass"><b>' + stats.approvedWeek + '</b><span>Approved this week</span></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<section class="stack"><div class="phase-title"><h3>Review queue</h3><a class="small" href="#reviews">See all</a></div>' + queueList(q.slice(0, 4)) + '</section>' +
        (can('applications') ? '<section class="stack"><div class="phase-title"><h3>New applications</h3><a class="small" href="#applications">See all</a></div>' +
          (apps.length ? '<div class="glass list">' + apps.slice(0, 3).map(function (a) {
            return '<a class="li" href="#applications"><span class="avatar">' + initials(a.name) + '</span><div class="li-main"><span class="li-title">' + esc(a.name) + '</span><span class="li-sub">' + esc(a.level) + '</span></div><div class="li-end"><span class="small muted">' + rel(a.createdAt) + '</span></div></a>';
          }).join('') + '</div>' : '<div class="glass empty"><span>No new applications.</span></div>') +
        '</section>' : '') +
      '</div>' +
      (isOwner() ? '<a class="glass card team-card" href="#lessons"><div class="li-main"><h3>Lessons</h3><span class="small muted">Read every step as students see it, proofread it and edit the wording.</span></div>' + ic('chev', 'chev') + '</a>' : '') +
      (isOwner() ? '<a class="glass card team-card" href="#team"><div class="li-main"><h3>Team & permissions</h3><span class="small muted">Add mentors, choose what each mentor and student can do, and see everyone’s activity.</span></div>' + ic('chev', 'chev') + '</a>' : '');
    return { html: html };
  }
  var mentorCache = [];
  function mentorName(id) { var m = mentorCache.filter(function (x) { return x.id === id; })[0]; return m ? short(m.name) : ''; }
  function queueList(q) {
    if (!q.length) return '<div class="glass empty">' + ic('done') + '<b>All caught up</b><span>New submissions will appear here.</span></div>';
    return '<div class="glass list">' + q.map(function (s) {
      var late = Date.now() - new Date(s.createdAt) > 48 * 3600e3, mine = s.member.mentorId === me.id;
      var who = s.member.mentorId ? (mine ? 'Your student' : mentorName(s.member.mentorId) + '’s student') : 'No mentor yet';
      return '<a class="li" href="#review-' + esc(s.id) + '"><span class="avatar warm">' + initials(s.member.name) + '</span><div class="li-main"><span class="li-title">' + esc(s.member.name) + '</span><span class="li-sub">' + esc(T(s.track).short) + ' · Step ' + s.step + ' · ' + esc(stepOf(s.track, s.step).title) + ' · ' + rel(s.createdAt) + '</span><span class="li-sub">' + esc(who) + '</span></div><div class="li-end">' + (late ? '<span class="pill revision">Over 48h</span>' : pill('review')) + ic('chev', 'chev') + '</div></a>';
    }).join('') + '</div>';
  }

  /* ---------- admin: reviews ---------- */
  var reviewFilter = null;
  async function vReviews() {
    var q = await S.queue();
    var mine = q.filter(function (s) { return s.member.mentorId === me.id; });
    if (!reviewFilter) reviewFilter = mine.length ? 'mine' : 'all';
    if (!seesAll()) reviewFilter = 'all';
    var list = reviewFilter === 'mine' ? mine : q, idx = reviewFilter === 'mine' ? 0 : 1;
    return {
      html: '<section class="page-head"><span class="eyebrow">Oldest first</span><h1>Reviews</h1><p class="muted">' + (q.length ? q.length + ' waiting. Aim to reply within 48 hours.' : 'Nothing waiting right now.') + '</p></section>' +
        (seesAll() ? '<div class="seg" id="rfilter" style="--n:2;--i:' + idx + '"><button type="button" data-f="mine">Your students · ' + mine.length + '</button><button type="button" data-f="all">Everyone · ' + q.length + '</button></div>' : '') +
        queueList(list),
      mount: function (m) {
        m.querySelectorAll('#rfilter button').forEach(function (b, i) {
          b.classList.toggle('on', i === idx);
          b.addEventListener('click', function () { reviewFilter = b.dataset.f; m.querySelector('#rfilter').style.setProperty('--i', i); setTimeout(render, 180); });
        });
      }
    };
  }

  async function vReview(id) {
    var s = await S.submission(id);
    if (!s) return { html: '<a class="back" href="#reviews">' + ic('back', 'chev') + 'Reviews</a><div class="glass empty"><b>Submission not found</b></div>' };
    var d = stepOf(s.track, s.step), ph = phaseOf(s.track, s.step), open = s.status === 'review', total = T(s.track).steps.length;
    var html = '<a class="back" href="#reviews">' + ic('back', 'chev') + 'Reviews</a>' +
      '<a class="glass card row" href="#member-' + esc(s.userId) + '" style="text-decoration:none;color:inherit"><span class="avatar lg warm">' + initials(s.member.name) + '</span><div class="li-main"><h3>' + esc(s.member.name) + '</h3><span class="small muted">' + esc(s.member.college || '') + '</span></div>' + ic('chev', 'chev') + '</a>' +
      (waNumber(s.member.phone) ? '<div class="row">' + waButton(waNumber(s.member.phone), 'Hi ' + short(s.member.name) + ', about your ' + T(s.track).name + ' Step ' + s.step + ' submission on Researchette: ', 'WhatsApp ' + short(s.member.name), 'btn-sm') + '</div>' : '') +
      '<article class="glass card stack-lg">' +
        '<div class="step-head"><div class="row spread wrap"><span class="eyebrow">' + esc(T(s.track).short) + ' · ' + esc(ph.name) + '</span>' + pill(s.status) + '</div><h2>Step ' + s.step + ' · ' + esc(d.title) + '</h2></div>' +
        '<div class="stack"><span class="small muted"><b>Task:</b> ' + esc(d.task.prompt) + '</span></div>' +
        '<div class="stack"><div class="row spread"><span class="eyebrow">Submission</span><span class="small muted">' + rel(s.createdAt) + ' · ' + words(s.text) + ' words</span></div><div class="paper">' + esc(s.text) + '</div></div>' +
        (s.history.length ? '<details><summary class="small muted" style="cursor:pointer">Earlier attempts (' + s.history.length + ')</summary><div class="stack" style="margin-top:12px">' + s.history.map(function (h) {
          return '<div class="note ' + (h.status === 'approved' ? 'teal' : 'red') + '"><span class="small muted">' + rel(h.createdAt) + '</span><div class="paper">' + esc(h.text) + '</div>' + (h.feedback ? '<p class="fb">' + esc(h.feedback) + '</p>' : '') + (h.reviewer ? '<div class="by">' + esc(h.reviewer.name) + '</div>' : '') + '</div>';
        }).join('') + '</div></details>' : '') +
        (open && !can('review') ? '<p class="note small">You can read this submission, but reviewing is switched off for your account.</p>' : '') +
        (open && can('review') ?
          '<div class="stack"><label for="fb">Your feedback</label><div class="chips" id="quick">' +
            ['Clear and well structured.', 'Be more specific about the population.', 'Add a reference for this.', 'Check the formatting.'].map(function (c) { return '<button type="button" class="chip" style="cursor:pointer">' + c + '</button>'; }).join('') +
          '</div><textarea id="fb" placeholder="What’s good, what needs fixing, and how to fix it."></textarea><p class="error" id="fb-err" hidden></p>' +
          '<div class="actions"><button class="btn btn-glass" type="button" id="revise">Request changes</button><button class="btn btn-teal" type="button" id="approve">Approve</button></div></div>'
          : '<div class="note ' + (s.status === 'approved' ? 'teal' : 'red') + '"><b class="small">' + LABEL[s.status] + '</b>' + (s.feedback ? '<p class="fb">' + esc(s.feedback) + '</p>' : '') + '</div>' +
            '<button class="btn btn-wa btn-sm" type="button" id="notify">' + ic('wa') + 'Notify ' + esc(short(s.member.name)) + ' on WhatsApp</button>') +
      '</article>';
    return {
      html: html, mount: function (m) {
        if (!open || !can('review')) {
          var nb = m.querySelector('#notify');
          if (nb) nb.addEventListener('click', function () { notifySheet(s.member, 'Notify ' + short(s.member.name), reviewMessage(s, s.status)); });
          return;
        }
        var fb = m.querySelector('#fb'), err = m.querySelector('#fb-err');
        m.querySelectorAll('#quick .chip').forEach(function (c) { c.addEventListener('click', function () { fb.value = (fb.value.trim() ? fb.value.trim() + ' ' : '') + c.textContent; fb.focus(); }); });
        function act(decision) {
          var text = fb.value.trim(), who = short(s.member.name);
          if (decision === 'revision' && !text) { err.textContent = 'Write what needs to change so the member knows how to fix it.'; err.hidden = false; fb.focus(); return; }
          if (!text) text = 'Well done. Approved.';
          S.review(id, decision, text, me.id).then(function () {
            go('reviews');
            notifySheet(s.member, decision === 'approved' ? (s.step < total ? 'Approved. Step ' + (s.step + 1) + ' unlocked for ' + who : T(s.track).name + ' complete for ' + who) : 'Sent back to ' + who, reviewMessage(s, decision));
          }, function (e) { toast(e.message); });
        }
        m.querySelector('#approve').addEventListener('click', function () { act('approved'); });
        m.querySelector('#revise').addEventListener('click', function () { act('revision'); });
      }
    };
  }

  /* ---------- chat ----------
     Members talk to all their mentors in one conversation; any mentor can reply. While a chat is
     open it checks for new messages every few seconds. */
  var chatTimer = 0, chatContext = null;
  function stopChat() { clearInterval(chatTimer); chatTimer = 0; }
  function clock(iso) { return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  function dayLabel(iso) {
    var d = new Date(iso), t = new Date(), y = new Date(Date.now() - 864e5);
    if (d.toDateString() === t.toDateString()) return 'Today';
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function linkify(html) { return html.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  // mentors' messages sit on the right for mentors (it's the team's side), and the member's own on the right for them
  function isMine(m) { return me.role === 'admin' ? m.role === 'admin' : m.senderId === me.id; }
  function bubble(m) {
    var mine = isMine(m), who = mine ? (m.senderId === me.id ? '' : first(m.senderName)) : (m.role === 'admin' ? first(m.senderName) : esc(m.senderName));
    return '<div class="msg ' + (mine ? 'mine' : 'theirs') + '" data-id="' + esc(m.id) + '">' +
      (who ? '<span class="msg-who">' + who + '</span>' : '') +
      (m.context ? '<span class="msg-ctx">' + esc(m.context) + '</span>' : '') +
      '<div class="msg-body">' + linkify(esc(m.body)) + '</div><time class="msg-time" datetime="' + esc(m.at) + '">' + clock(m.at) + '</time></div>';
  }
  function thread(list) {
    var out = '', day = '';
    list.forEach(function (m) { var d = dayLabel(m.at); if (d !== day) { day = d; out += '<div class="msg-day"><span>' + d + '</span></div>'; } out += bubble(m); });
    return out;
  }
  /* the conversation screen, shared by members and mentors */
  function chatScreen(o) {
    var html = o.head + '<section class="chat" aria-live="polite">' +
      '<div class="msgs" id="msgs">' + (o.messages.length ? thread(o.messages) : o.empty) + '</div></section>' +
      '<form class="composer glass" id="composer" novalidate>' +
        '<div class="ctx-chip" id="ctx"' + (o.context ? '' : ' hidden') + '><span>About: <b id="ctx-t">' + esc(o.context || '') + '</b></span><button type="button" id="ctx-x" aria-label="Remove topic">×</button></div>' +
        '<div class="composer-row"><textarea id="msg-in" rows="1" maxlength="4000" placeholder="' + esc(o.placeholder) + '" aria-label="Message"></textarea>' +
        '<button class="btn btn-primary send" type="submit" aria-label="Send">' + ic('send') + '</button></div>' +
      '</form>';
    return { html: html, mount: function (m) {
      var box = m.querySelector('#msgs'), f = m.querySelector('#composer'), inp = m.querySelector('#msg-in'), send = f.querySelector('.send');
      var ctx = o.context || '', seen = {}, last = '';
      o.messages.forEach(function (x) { seen[x.id] = 1; last = x.at; });
      var toEnd = function (smooth) { scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth && !reduce ? 'smooth' : 'instant' }); };
      var nearEnd = function () { return innerHeight + scrollY > document.documentElement.scrollHeight - 160; };
      var add = function (list) {
        list = list.filter(function (x) { return !seen[x.id]; });
        if (!list.length) return;
        var stick = nearEnd();
        if (box.querySelector('.chat-empty')) box.innerHTML = '';
        list.forEach(function (x) {
          seen[x.id] = 1;
          var prev = box.querySelector('.msg:last-of-type time'), d = dayLabel(x.at);
          if (!prev || dayLabel(prev.getAttribute('datetime')) !== d) box.insertAdjacentHTML('beforeend', '<div class="msg-day"><span>' + d + '</span></div>');
          box.insertAdjacentHTML('beforeend', bubble(x));
          last = x.at;
        });
        if (stick) toEnd(true);
      };
      var grow = function () { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 180) + 'px'; };
      inp.addEventListener('input', grow);
      m.querySelector('#ctx-x').addEventListener('click', function () { ctx = ''; m.querySelector('#ctx').hidden = true; inp.focus(); });
      m.querySelectorAll('[data-suggest]').forEach(function (b) { b.addEventListener('click', function () { inp.value = b.textContent; grow(); inp.focus(); }); });
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); f.requestSubmit(); } });
      }
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = inp.value.trim();
        if (!text || send.disabled) return;
        send.disabled = true;
        o.send(text, ctx).then(function (msg) {
          inp.value = ''; grow(); ctx = ''; m.querySelector('#ctx').hidden = true;
          add([msg]); toEnd(true);
        }, function (err) { toast(err.message); }).then(function () { send.disabled = false; inp.focus(); });
      });
      toEnd(false);
      if (o.context) inp.focus();
      chatTimer = setInterval(function () {
        if (document.hidden) return;
        o.load(last).then(function (r) { add(r.messages); }, function () {});
      }, 4000);
      // reading a chat clears its badge
      lastBadges = Object.assign({}, lastBadges); lastBadges[me.role === 'admin' ? 'unreadChats' : 'unread'] = 0;
      if (me.role === 'admin') S.adminUnread().then(function (x) { lastBadges.unreadChats = x.unread; setTabs(currentTab, lastBadges); }, function () {});
      else setTabs(currentTab, lastBadges);
    } };
  }

  async function vMemberChat() {
    var r = await S.chat(), context = chatContext; chatContext = null;
    var suggest = ['I’m stuck on today’s step.', 'Can you check my research question?', 'Which journal should I choose?'];
    return chatScreen({
      messages: r.messages, context: context, placeholder: 'Message your mentor…',
      head: '<section class="page-head"><span class="eyebrow">Chat</span><h1>Ask your mentor</h1><p class="muted">Stuck on a step or unsure about something? Ask here. Your mentor usually replies within a day.</p></section>',
      empty: '<div class="chat-empty">' + ic('msgs') + '<b>No messages yet</b><span>Ask anything about your research. Try one of these:</span><div class="chips">' +
        suggest.map(function (x) { return '<button class="chip" type="button" data-suggest>' + esc(x) + '</button>'; }).join('') + '</div></div>',
      load: function (after) { return S.chat(after); },
      send: function (text, ctx) { return S.sendChat(text, ctx); }
    });
  }

  async function vMentorChat(id) {
    var r = await S.chatWith(id), u = r.member, fn = short(u.name);
    return chatScreen({
      messages: r.messages, placeholder: 'Reply to ' + fn + '…',
      head: '<a class="back" href="#messages">' + ic('back', 'chev') + 'Messages</a>' +
        '<div class="glass card chat-who"><a class="row" href="#member-' + esc(u.id) + '" style="text-decoration:none;color:inherit;flex:1;min-width:0"><span class="avatar warm">' + initials(u.name) + '</span><div class="li-main"><h3>' + esc(u.name) + '</h3><span class="small muted">' + esc([T(u.activeTrack).name, u.college].filter(Boolean).join(' · ')) + '</span></div></a>' +
        (waNumber(u.phone) ? waButton(waNumber(u.phone), 'Hi ' + fn + ', I’ve replied to you in the Researchette portal chat: ' + location.href.split('#')[0] + '#chat', 'WhatsApp', 'btn-sm') : '') + '</div>',
      empty: '<div class="chat-empty">' + ic('msgs') + '<b>No messages yet</b><span>Start the conversation. ' + esc(fn) + ' will see it next time they open the portal.</span></div>',
      load: function (after) { return S.chatWith(id, after); },
      send: function (text) { return S.sendChatTo(id, text); }
    });
  }

  var chatFilter = 'mine';
  async function vMessages() {
    var all = await S.chats(), mineList = all.filter(function (c) { return c.mine; });
    var showAll = seesAll() && chatFilter === 'all', list = seesAll() ? (showAll ? all : mineList) : all;
    var unread = list.filter(function (c) { return c.unread; }).length;
    var rows = list.map(function (c) {
      var assigned = c.mine ? '' : '<span class="li-sub">' + (c.member.mentorName ? esc(first(c.member.mentorName)) + '’s student' : 'No mentor yet') + '</span>';
      var who = c.last.role === 'admin' ? (c.last.senderName && c.last.senderName !== me.name ? first(c.last.senderName) : 'You') + ': ' : '';
      return '<a class="li chat-li' + (c.unread ? ' unread' : '') + '" href="#chat-' + esc(c.member.id) + '"><span class="avatar warm">' + initials(c.member.name) + '</span>' +
        '<div class="li-main"><span class="li-title">' + esc(c.member.name) + '</span><span class="li-sub">' + who + esc(c.last.body) + '</span>' + assigned + '</div>' +
        '<div class="li-end"><span class="small muted">' + rel(c.last.at) + '</span>' + (c.unread ? '<span class="badge">' + c.unread + '</span>' : '') + '</div></a>';
    }).join('');
    return { html: '<section class="page-head"><span class="eyebrow">Chat</span><h1>Messages</h1><p class="muted">' +
        (list.length ? (unread ? unread + ' conversation' + (unread === 1 ? '' : 's') + ' waiting for a reply.' : 'You’re all caught up.') : showAll ? 'No conversations yet.' : 'When one of your students sends a message, it shows up here.') + '</p></section>' +
      (seesAll() ? '<div class="seg" id="cfilter" style="--n:2;--i:' + (showAll ? 1 : 0) + '"><button type="button" data-f="mine"' + (showAll ? '' : ' class="on"') + '>For you · ' + mineList.length + '</button><button type="button" data-f="all"' + (showAll ? ' class="on"' : '') + '>Everyone · ' + all.length + '</button></div>' : '') +
      (list.length ? '<div class="glass list">' + rows + '</div>' : '<div class="glass empty">' + ic('msgs') + '<b>No conversations yet</b><span>To message a member first, open them in Members and tap Chat.</span></div>'),
      mount: function (m) {
        m.querySelectorAll('#cfilter button').forEach(function (b, i) {
          b.addEventListener('click', function () { chatFilter = b.dataset.f; m.querySelector('#cfilter').style.setProperty('--i', i); setTimeout(render, 180); });
        });
      } };
  }

  /* ---------- switches (permissions) ---------- */
  function toggles(items, name) {
    return '<div class="toggles">' + items.map(function (t) {
      return '<label class="toggle"><span class="t-txt"><b>' + esc(t[1]) + '</b>' + (t[2] ? '<span>' + esc(t[2]) + '</span>' : '') + '</span>' +
        '<input type="checkbox" role="switch" data-' + name + '="' + t[0] + '"' + (t[3] ? ' checked' : '') + (t[4] ? ' disabled' : '') + '><span class="sw" aria-hidden="true"></span></label>';
    }).join('') + '</div>';
  }
  function bindToggles(root, name, fn) {
    root.querySelectorAll('[data-' + name + ']').forEach(function (i) { i.addEventListener('change', function () { fn(i.getAttribute('data-' + name), i.checked, i); }); });
  }

  /* ---------- owners: lessons (proofread and edit) ---------- */
  var lessonTrack = null;
  async function vLessons() {
    await loadLessons(true);
    if (!lessonTrack) lessonTrack = C.tracks[0].id;
    var tr = T(lessonTrack), edited = function (t, n) { return !!lessonEdits[t + ':' + n]; };
    var count = Object.keys(lessonEdits).length;
    return { html: '<a class="back" href="#overview">' + ic('back', 'chev') + 'Overview</a>' +
      '<section class="page-head"><span class="eyebrow">Owners only</span><h1>Lessons</h1><p class="muted">Open any step to read it exactly as students see it, then edit the wording. Changes show up for students straight away. ' +
        (count ? count + ' step' + (count === 1 ? ' has' : 's have') + ' been edited.' : 'Nothing has been edited yet.') + '</p></section>' +
      '<div class="chips pick" id="ltracks">' + C.tracks.map(function (x) { return '<label><input type="radio" name="lt" value="' + x.id + '"' + (x.id === lessonTrack ? ' checked' : '') + '><span>' + esc(x.name) + '</span></label>'; }).join('') + '</div>' +
      tr.phases.map(function (ph) {
        var steps = tr.steps.filter(function (x) { return x.phase === ph.id; });
        return '<div class="stack"><div class="phase-title"><h3>' + esc(ph.name) + '</h3></div><div class="glass list">' + steps.map(function (x) {
          return '<a class="li" href="#lesson-' + tr.id + '-' + x.n + '"><span class="sicon ' + (edited(tr.id, x.n) ? 'review' : 'approved') + '">' + x.n + '</span><div class="li-main"><span class="li-title">' + esc(x.title) + '</span><span class="li-sub">' + esc(x.summary) + ' · ' + x.minutes + ' min</span></div>' +
            '<div class="li-end">' + (edited(tr.id, x.n) ? '<span class="pill review">Edited</span>' : '') + ic('chev', 'chev') + '</div></a>';
        }).join('') + '</div></div>';
      }).join(''),
      mount: function (m) { m.querySelectorAll('input[name="lt"]').forEach(function (i) { i.addEventListener('change', function () { lessonTrack = i.value; render(); }); }); } };
  }
  async function vLesson(t, n) {
    await loadLessons(true);
    if (!C.tracks.some(function (x) { return x.id === t; }) || !(n >= 1 && n <= T(t).steps.length)) { setHash('lessons'); return vLessons(); }
    lessonTrack = t;
    var tr = T(t), total = tr.steps.length, key = t + ':' + n, ed = lessonEdits[key], d = stepOf(t, n);
    var fake = tr.steps.map(function (x) { return { step: x.n, status: x.n === n ? 'current' : 'approved', submission: null }; });
    var card = stepCard(t, n, fake, true);
    var nav = '<div class="row spread lesson-nav">' + (n > 1 ? '<a class="btn btn-quiet btn-sm" href="#lesson-' + t + '-' + (n - 1) + '">← Step ' + (n - 1) + '</a>' : '<span></span>') +
      (n < total ? '<a class="btn btn-quiet btn-sm" href="#lesson-' + t + '-' + (n + 1) + '">Step ' + (n + 1) + ' →</a>' : '<span></span>') + '</div>';
    var html = '<a class="back" href="#lessons">' + ic('back', 'chev') + 'Lessons</a>' +
      '<div class="glass card lesson-bar"><div class="li-main"><span class="eyebrow">' + esc(tr.name) + ' · Step ' + n + ' of ' + total + '</span>' +
        '<span class="small muted">' + (ed ? 'Edited by ' + esc(ed.by || 'an owner') + ' · ' + rel(ed.at) : 'Original wording') + '</span></div>' +
        '<div class="row">' + (ed ? '<button class="btn btn-quiet btn-sm" type="button" id="l-reset">Reset to original</button>' : '') + '<button class="btn btn-primary btn-sm" type="button" id="l-edit">' + ic('pen') + 'Edit</button></div></div>' +
      '<p class="small muted">Preview: this is exactly what students see.</p>' + card.html + nav;
    return { html: html, mount: function (m) {
      card.mount(m);
      m.querySelector('#l-edit').addEventListener('click', function () { lessonEditor(m, t, n, d); });
      var rs = m.querySelector('#l-reset');
      if (rs) rs.addEventListener('click', function () {
        sheet('<h2>Reset step ' + n + ' to the original?</h2><p class="muted">Your edits to “' + esc(d.title) + '” are removed and students see the built-in wording again.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-primary" type="button" id="yes" style="flex:1">Reset</button></div>',
          function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.resetLesson(t, n).then(function () { close(); toast('Back to the original'); loadLessons(true).then(render); }, function (e) { toast(e.message); }); }); });
      });
    } };
  }
  function lessonEditor(m, t, n, d) {
    var lines = function (a) { return esc((a || []).join('\n')); };
    var point = function (l) { return '<div class="le-point"><input class="le-h" value="' + esc(l.h) + '" placeholder="Heading" aria-label="Point heading"><textarea class="le-p" rows="3" placeholder="Explanation" aria-label="Point text">' + esc(l.p) + '</textarea><button class="btn btn-quiet btn-sm le-del" type="button">Remove</button></div>'; };
    var area = function (id, label, val, rows, hint) { return '<div class="field"><label for="' + id + '">' + label + '</label>' + (hint ? '<span class="small muted">' + hint + '</span>' : '') + '<textarea id="' + id + '" rows="' + (rows || 3) + '">' + esc(val || '') + '</textarea></div>'; };
    var box = m.querySelector('#stepcard');
    box.outerHTML = '<form class="glass card stack-lg lesson-editor" id="lform" novalidate>' +
      '<div><h2>Edit step ' + n + '</h2><p class="small muted">Charts and tables stay as they are. Leave a box empty to hide that section.</p></div>' +
      '<div class="field"><label for="le-title">Title</label><input id="le-title" value="' + esc(d.title) + '"></div>' +
      '<div class="row wrap" style="gap:12px"><div class="field" style="flex:3;min-width:200px"><label for="le-summary">Short description</label><input id="le-summary" value="' + esc(d.summary) + '"></div>' +
        '<div class="field" style="flex:1;min-width:100px"><label for="le-min">Minutes</label><input id="le-min" type="number" min="1" max="240" value="' + d.minutes + '"></div></div>' +
      '<h3>Learn</h3>' + area('le-intro', 'In simple words', d.intro, 3) +
      '<div class="field"><span class="small" style="font-weight:600">Step by step</span><div id="le-points" class="stack">' + (d.lesson || []).map(point).join('') + '</div><button class="btn btn-glass btn-sm" type="button" id="le-add" style="justify-self:start">+ Add a point</button></div>' +
      area('le-mistakes', 'Common mistakes to avoid', (d.mistakes || []).join('\n'), 4, 'One per line.') +
      '<h3>Example</h3>' + area('le-weak', 'Weak example', d.example && d.example.weak, 3) + area('le-strong', 'Strong example', d.example && d.example.strong, 3) + area('le-why', 'Why it works', d.example && d.example.why, 3) +
      '<h3>Task</h3>' + area('le-prompt', 'Task instructions', d.task && d.task.prompt, 3) +
      area('le-include', 'What to include', (d.include || []).join('\n'), 4, 'One per line.') + area('le-template', 'Template', d.template, 5, 'What students get when they tap “Use a template”.') +
      '<p class="error" id="le-err" role="alert" hidden></p>' +
      '<div class="row spread wrap lesson-save"><button class="btn btn-quiet" type="button" id="le-cancel">Cancel</button><button class="btn btn-primary" type="submit">Save changes</button></div>' +
    '</form>';
    var f = m.querySelector('#lform'), pts = f.querySelector('#le-points');
    var bindDel = function (root) { root.querySelectorAll('.le-del').forEach(function (b) { b.onclick = function () { b.closest('.le-point').remove(); }; }); };
    bindDel(f);
    f.querySelector('#le-add').addEventListener('click', function () { pts.insertAdjacentHTML('beforeend', point({ h: '', p: '' })); bindDel(pts); pts.lastElementChild.querySelector('input').focus(); });
    f.querySelector('#le-cancel').addEventListener('click', render);
    f.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return f.querySelector('#' + id).value.trim(); }, list = function (id) { return v(id).split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };
      var err = f.querySelector('#le-err');
      if (!v('le-title')) { err.textContent = 'The step needs a title.'; err.hidden = false; return; }
      var data = {
        title: v('le-title'), summary: v('le-summary'), minutes: +v('le-min') || d.minutes, intro: v('le-intro'),
        lesson: [].slice.call(pts.querySelectorAll('.le-point')).map(function (p) { return { h: p.querySelector('.le-h').value.trim(), p: p.querySelector('.le-p').value.trim() }; }).filter(function (l) { return l.h || l.p; }),
        mistakes: list('le-mistakes'), example: { weak: v('le-weak'), strong: v('le-strong'), why: v('le-why') },
        task: { prompt: v('le-prompt') }, include: list('le-include'), template: f.querySelector('#le-template').value.replace(/\s+$/, '')
      };
      var btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Saving…';
      S.saveLesson(t, n, data).then(function () { toast('Saved. Students see the new wording now.'); loadLessons(true).then(render); },
        function (x) { err.textContent = x.message; err.hidden = false; btn.disabled = false; btn.textContent = 'Save changes'; });
    });
  }

  /* ---------- owners: team & permissions ---------- */
  var MENTOR_PERMS = [
    ['review', 'Review submissions', 'Approve tasks or ask for changes, for their students.'],
    ['chat', 'Chat with students', 'Read and reply to their students’ messages.'],
    ['edit_members', 'Edit student details', 'Change their students’ programmes and WhatsApp numbers.'],
    ['see_all', 'See all students', 'See every student, not only the ones assigned to them.'],
    ['applications', 'Handle applications', 'See applications, mark them paid, approve or decline.'],
    ['add_members', 'Add and remove students', 'Create student logins and delete students.'],
    ['passwords', 'Reset student passwords', 'Reset or set passwords for their students.']
  ];
  async function vTeam() {
    var r = await S.team();
    var rows = r.team.map(function (t) {
      var on = MENTOR_PERMS.filter(function (p) { return t.perms[p[0]]; }).length;
      return '<a class="li" href="#admin-' + esc(t.id) + '"><span class="avatar">' + initials(t.name) + '</span><div class="li-main"><span class="li-title">' + esc(t.name) + (t.id === me.id ? ' <span class="muted small">(you)</span>' : '') + '</span>' +
        '<span class="li-sub">' + esc(t.title || 'Mentor') + ' · ' + t.students + ' student' + (t.students === 1 ? '' : 's') + (t.owner ? ' · ' + (t.twoStep.on ? 'Two-step on' : 'Two-step set up at next login') : ' · ' + on + ' of ' + MENTOR_PERMS.length + ' permissions') + '</span></div>' +
        '<div class="li-end">' + (t.owner ? '<span class="pill approved">Owner</span>' : t.active ? '<span class="pill">Mentor</span>' : '<span class="pill revision">Paused</span>') + ic('chev', 'chev') + '</div></a>';
    }).join('');
    return { html: '<a class="back" href="#overview">' + ic('back', 'chev') + 'Overview</a>' +
      '<section class="page-head"><div class="row spread wrap"><div class="stack" style="gap:6px"><span class="eyebrow">Owners only</span><h1>Team & permissions</h1></div><button class="btn btn-primary" type="button" id="add-mentor">+ Add mentor</button></div>' +
      '<p class="muted">Owners see and manage everything. Mentors see only the students assigned to them, and only do what you switch on.' + (r.unassigned ? ' ' + r.unassigned + ' student' + (r.unassigned === 1 ? ' has' : 's have') + ' no mentor, so their messages come to the owners.' : '') + '</p></section>' +
      '<div class="glass list">' + rows + '</div>',
      mount: function (m) { m.querySelector('#add-mentor').addEventListener('click', addMentorSheet); } };
  }
  function addMentorSheet() {
    sheet('<h2>Add a mentor</h2><p class="muted small">Creates a mentor login with a temporary password. They start with the basic permissions; change them after.</p>' +
      '<form id="amt" class="stack" novalidate>' +
        '<div class="field"><label for="amt-name">Full name</label><input id="amt-name" autocomplete="off" required placeholder="Dr Sara Khan"></div>' +
        '<div class="field"><label for="amt-email">Email</label><input id="amt-email" type="email" autocomplete="off" required placeholder="sara@researchette.com"></div>' +
        '<div class="field"><label for="amt-title">Title</label><input id="amt-title" autocomplete="off" placeholder="Mentor"></div>' +
        '<label class="toggle"><span class="t-txt"><b>Make them an owner</b><span>Owners can see everything and manage the team.</span></span><input type="checkbox" role="switch" id="amt-owner"><span class="sw" aria-hidden="true"></span></label>' +
        '<p class="error" id="amt-err" role="alert" hidden></p>' +
        '<button class="btn btn-primary btn-block" type="submit">Create mentor</button><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Cancel</button>' +
      '</form>',
      function (el, close) {
        var f = el.querySelector('#amt'), err = el.querySelector('#amt-err'), v = function (id) { return el.querySelector('#' + id).value.trim(); };
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var show = function (msg) { err.textContent = msg; err.hidden = false; };
          if (!v('amt-name')) return show('Enter the mentor’s name.');
          if (!/.+@.+\..+/.test(v('amt-email'))) return show('Enter a valid email address.');
          S.addMentor({ name: v('amt-name'), email: v('amt-email'), title: v('amt-title'), owner: el.querySelector('#amt-owner').checked })
            .then(function (res) { close(); credentialsSheet(res.user, res.password, 'Mentor added', 'Send these details to the new mentor.'); }, function (x) { show(x.message); });
        });
      });
  }
  async function vTeamMember(id) {
    var r = await S.team(), t = r.team.filter(function (x) { return x.id === id; })[0];
    if (!t) return { html: '<a class="back" href="#team">' + ic('back', 'chev') + 'Team</a><div class="glass empty"><b>Mentor not found</b><span>They may have been removed.</span></div>' };
    var self = t.id === me.id, fn = short(t.name);
    var html = '<a class="back" href="#team">' + ic('back', 'chev') + 'Team</a>' +
      '<div class="glass card stack"><div class="row"><span class="avatar lg">' + initials(t.name) + '</span><div class="li-main"><h2>' + esc(t.name) + '</h2><span class="small muted">' + esc(t.email) + '</span></div></div>' +
        '<div class="chips"><span class="chip">' + (t.owner ? 'Owner' : 'Mentor') + '</span><span class="chip">' + t.students + ' student' + (t.students === 1 ? '' : 's') + '</span><span class="chip">Joined ' + rel(t.joined) + '</span></div>' +
        '<form class="row wrap" id="title-f"><input id="title-in" value="' + esc(t.title || '') + '" placeholder="Title, e.g. Senior mentor" aria-label="Title" style="flex:1;min-width:180px"><button class="btn btn-glass btn-sm" type="submit">Save title</button></form>' +
      '</div>' +
      '<div class="glass card stack"><div><h3>Role</h3><p class="small muted">Owners can see every student, message and activity, and manage the team.</p></div>' +
        toggles([['owner', 'Owner', 'Full access to everything, including this page.', t.owner], ['active', 'Account active', 'Pausing logs them out and stops them logging in. Their students stay.', t.active, self]], 'role') + '</div>' +
      (t.owner ? '<div class="glass card"><p class="small muted">Owners have every permission.</p></div>' :
        '<div class="glass card stack"><div><h3>What ' + esc(fn) + ' can do</h3><p class="small muted">They only ever see the students assigned to them' + (t.perms.see_all ? ', plus everyone, because “See all students” is on.' : '.') + '</p></div>' +
          toggles(MENTOR_PERMS.map(function (p) { return [p[0], p[1], p[2], t.perms[p[0]]]; }), 'perm') + '</div>') +
      (t.owner ? '<div class="glass card stack"><div><h3>Two-step verification</h3><p class="small muted">' +
          (t.twoStep.on ? 'On. ' + t.twoStep.devices + ' remembered device' + (t.twoStep.devices === 1 ? '' : 's') + ', ' + t.twoStep.recoveryLeft + ' recovery code' + (t.twoStep.recoveryLeft === 1 ? '' : 's') + ' left.' : 'Not set up yet. ' + esc(fn) + ' will be asked to set it up at their next login.') + '</p></div>' +
          (!self && t.twoStep.on ? '<div class="account-actions"><button class="btn btn-glass btn-sm" type="button" id="t-2fa">Reset two-step verification</button></div><p class="small muted">Use this if ' + esc(fn) + ' lost their phone. They’ll be logged out and set it up again with a new QR code.</p>' : '') +
        '</div>' : '') +
      '<div class="glass card stack"><h3>Account</h3><div class="account-actions">' +
        '<button class="btn btn-glass btn-sm" type="button" id="t-reset">Reset password</button><button class="btn btn-glass btn-sm" type="button" id="t-set">Set a password</button>' +
        (self ? '' : '<button class="btn btn-danger btn-sm" type="button" id="t-remove">Remove from team</button>') + '</div>' +
        '<p class="small muted">Resetting their password logs them out everywhere and disconnects their AI apps.</p></div>';
    return { html: html, mount: function (m) {
      var save = function (data, input) { return S.updateMentor(id, data).then(function () { toast('Saved'); if (data.owner !== undefined && self) { forgetMe(); } render(); }, function (e) { if (input) input.checked = !input.checked; toast(e.message); }); };
      m.querySelector('#title-f').addEventListener('submit', function (e) { e.preventDefault(); save({ title: m.querySelector('#title-in').value.trim() }); });
      bindToggles(m, 'role', function (k, on, input) { var d = {}; d[k] = on; save(d, input); });
      bindToggles(m, 'perm', function (k, on, input) { var d = { perms: {} }; d.perms[k] = on; save(d, input); });
      m.querySelector('#t-reset').addEventListener('click', function () {
        sheet('<h2>Reset ' + esc(fn) + '’s password?</h2><p class="muted">A new temporary password is created, the old one stops working, and they’re logged out everywhere.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-primary" type="button" id="yes" style="flex:1">Reset</button></div>',
          function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.mentorPassword(id).then(function (res) { close(); credentialsSheet(res.user, res.password, 'Password reset', 'Send the new password to ' + fn + '.'); }, function (e) { toast(e.message); }); }); });
      });
      m.querySelector('#t-set').addEventListener('click', function () {
        sheet('<h2>Set a password for ' + esc(fn) + '</h2><form id="tsp" class="stack" novalidate><div class="field"><label for="tsp-in">New password</label><input id="tsp-in" type="text" autocomplete="off" placeholder="At least 8 characters"></div><p class="error" id="tsp-err" role="alert" hidden></p><button class="btn btn-primary btn-block" type="submit">Save password</button><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Cancel</button></form>',
          function (el, close) {
            el.querySelector('#tsp').addEventListener('submit', function (e) {
              e.preventDefault();
              S.mentorPassword(id, el.querySelector('#tsp-in').value).then(function (res) { close(); if (self) { forgetMe(); go('login'); return; } credentialsSheet(res.user, res.password, 'Password changed', 'Send the new password to ' + fn + '.'); },
                function (x) { var er = el.querySelector('#tsp-err'); er.textContent = x.message; er.hidden = false; });
            });
          });
      });
      var r2 = m.querySelector('#t-2fa');
      if (r2) r2.addEventListener('click', function () {
        sheet('<h2>Reset ' + esc(fn) + '’s two-step verification?</h2><p class="muted">They’ll be logged out everywhere. At their next login they scan a new QR code and get new recovery codes.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-primary" type="button" id="yes" style="flex:1">Reset</button></div>',
          function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.resetTwoStep(id).then(function () { close(); toast('Two-step verification reset'); render(); }, function (e) { toast(e.message); }); }); });
      });
      var rmv = m.querySelector('#t-remove');
      if (rmv) rmv.addEventListener('click', function () {
        sheet('<h2>Remove ' + esc(t.name) + '?</h2><p class="muted">Their login stops working. Their ' + t.students + ' student' + (t.students === 1 ? '' : 's') + ' stay, with no mentor, so the owners get their messages until you assign someone new.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-danger" type="button" id="yes" style="flex:1">Remove</button></div>',
          function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.removeMentor(id).then(function () { close(); toast(t.name + ' removed'); go('team'); }, function (e) { toast(e.message); }); }); });
      });
    } };
  }

  /* ---------- admin: members ---------- */
  function dots(states) { return '<div class="dots" style="grid-template-columns:repeat(' + states.length + ',1fr)" aria-hidden="true">' + states.map(function (x) { return '<i class="' + x.status + '"></i>'; }).join('') + '</div>'; }
  function levelOptions(sel) { return '<option value="">Choose one</option>' + LEVELS.map(function (l) { return '<option' + (l === sel ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); }
  function mentorOptions(sel) { return '<option value="">No mentor yet</option>' + mentorCache.map(function (m) { return '<option value="' + esc(m.id) + '"' + (m.id === sel ? ' selected' : '') + '>' + esc(m.name) + '</option>'; }).join(''); }
  function trackChips(selected, name) {
    return '<div class="chips pick">' + C.tracks.map(function (t) {
      return '<label><input type="checkbox" name="' + name + '" value="' + t.id + '"' + (selected.indexOf(t.id) > -1 ? ' checked' : '') + '><span>' + esc(t.name) + '</span></label>';
    }).join('') + '</div>';
  }
  function welcomeMessage(u, pw) {
    return 'Welcome to Researchette, ' + short(u.name) + '!\n\nYour member portal login:\nEmail: ' + u.email + '\nPassword: ' + pw + '\n\nLog in here: ' + location.href.split('#')[0] + '\nYour first task is waiting.';
  }
  function credentialsSheet(u, pw, title, note) {
    var msg = welcomeMessage(u, pw), num = waNumber(u.phone);
    sheet('<span class="stamp">' + esc(title) + '</span><h2>Login details for ' + esc(u.name) + '</h2><p class="muted">' + esc(note) + ' For security, the password is only shown once.</p>' +
      '<div class="cred"><span>Email</span><b>' + esc(u.email) + '</b></div><div class="cred"><span>Password</span><b>' + esc(pw) + '</b></div>' +
      '<pre class="paper small" id="msg" style="margin:0;font-family:var(--f-body)">' + esc(msg) + '</pre>' +
      (num ? waButton(num, msg, 'Send on WhatsApp', 'btn-block') : '') +
      '<button class="btn btn-primary btn-block" type="button" id="cp">Copy message</button><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Done</button>',
      function (el) {
        el.querySelector('#cp').addEventListener('click', function () { copy(msg, el.querySelector('#msg')); });
        el.querySelector('[data-close]').addEventListener('click', render);
      });
  }

  /* After a review or a change to a member's account: a ready-made WhatsApp message the mentor can
     edit and send, so the student knows to open the portal. */
  var portalUrl = function () { return location.href.split('#')[0]; };
  function reviewMessage(s, decision) {
    var fn = short(s.member.name), tr = T(s.track), d = stepOf(s.track, s.step), last = s.step >= tr.steps.length;
    var what = 'your ' + tr.name + ' Step ' + s.step + ' (' + d.title + ')';
    if (decision === 'approved') return 'Hi ' + fn + ', ' + what + ' has been approved on Researchette. ' +
      (last ? 'That completes the whole ' + tr.name + ' programme. Well done!' : 'Step ' + (s.step + 1) + ' is now unlocked.') + '\n\nLog in to read the feedback: ' + portalUrl();
    return 'Hi ' + fn + ', I’ve reviewed ' + what + ' on Researchette and asked for a few changes. Log in to read the feedback and resubmit: ' + portalUrl();
  }
  function notifySheet(member, title, msg) {
    var num = waNumber(member.phone), fn = short(member.name);
    sheet('<h2>' + esc(title) + '</h2><p class="muted">Let ' + esc(fn) + ' know on WhatsApp so they check the portal. You can edit the message first.</p>' +
      '<textarea id="n-msg" rows="6" aria-label="Message">' + esc(msg) + '</textarea>' +
      (num ? '<a class="btn btn-wa btn-block" id="n-wa" data-autofocus href="' + esc(waLink(num, msg)) + '" target="_blank" rel="noopener">' + ic('wa') + 'Send to ' + esc(fn) + ' on WhatsApp</a>'
        : '<p class="note small">No WhatsApp number saved for ' + esc(fn) + '. <a href="#member-' + esc(member.id) + '" data-close>Add one on their page</a>, or copy the message.</p>') +
      '<button class="btn btn-glass btn-block" type="button" id="n-cp"' + (num ? '' : ' data-autofocus') + '>Copy message</button><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Done</button>',
      function (el, close) {
        var ta = el.querySelector('#n-msg'), wa = el.querySelector('#n-wa');
        ta.addEventListener('input', function () { if (wa) wa.href = waLink(num, ta.value); });
        if (wa) wa.addEventListener('click', function () { setTimeout(close, 300); });
        el.querySelector('#n-cp').addEventListener('click', function () { copy(ta.value, ta); });
      });
  }
  var changes = {}; /* member id -> what was changed on their page, waiting to be sent */

  var memberFilter = 'all';
  async function vMembers() {
    var got = await Promise.all([S.members(), S.mentors()]), list = got[0]; mentorCache = got[1];
    var mine = list.filter(function (u) { return u.mentorId === me.id; });
    var shown = memberFilter === 'mine' && seesAll() ? mine : list, idx = memberFilter === 'mine' ? 1 : 0;
    var rows = function (arr) {
      if (!arr.length) return '<div class="empty"><span>' + (memberFilter === 'mine' || !seesAll() ? 'No students are assigned to you yet.' : 'No members yet. Add one to get started.') + '</span></div>';
      return arr.map(function (u) {
        var st = u.current ? u.current.status : 'approved';
        var sub = [T(u.activeTrack).short + (u.tracks.length > 1 ? ' +' + (u.tracks.length - 1) : ''), u.mentor ? short(u.mentor.name) : 'No mentor'].join(' · ');
        return '<a class="li" href="#member-' + esc(u.id) + '" data-q="' + esc((u.name + ' ' + u.email + ' ' + (u.college || '')).toLowerCase()) + '"><span class="avatar warm">' + initials(u.name) + '</span><div class="li-main"><span class="li-title">' + esc(u.name) + '</span><span class="li-sub">' + esc(sub) + '</span></div><div class="li-end"><span class="small muted">' + u.done + '/' + u.total + '</span>' + pill(st) + '</div></a>';
      }).join('');
    };
    return {
      html: '<section class="page-head"><div class="row spread wrap"><div class="stack" style="gap:6px"><span class="eyebrow">' + list.length + ' members</span><h1>' + (seesAll() ? 'Members' : 'Your students') + '</h1></div>' + (can('add_members') ? '<button class="btn btn-primary" type="button" id="add-member">+ Add member</button>' : '') + '</div></section>' +
        (seesAll() ? '<div class="seg" id="mfilter" style="--n:2;--i:' + idx + '"><button type="button" data-f="all">Everyone · ' + list.length + '</button><button type="button" data-f="mine">Your students · ' + mine.length + '</button></div>' : '') +
        '<div class="search">' + ic('search') + '<input id="q" type="search" placeholder="Search by name, email or college" aria-label="Search members"></div>' +
        '<div class="glass list" id="mlist">' + rows(shown) + '</div>',
      mount: function (m) {
        var am = m.querySelector('#add-member'); if (am) am.addEventListener('click', addMemberSheet);
        m.querySelectorAll('#mfilter button').forEach(function (b, i) {
          b.classList.toggle('on', i === idx);
          b.addEventListener('click', function () { memberFilter = b.dataset.f; m.querySelector('#mfilter').style.setProperty('--i', i); setTimeout(render, 180); });
        });
        var q = m.querySelector('#q');
        q.addEventListener('input', function () {
          var v = q.value.trim().toLowerCase(), any = false;
          m.querySelectorAll('#mlist .li').forEach(function (r) { var hit = r.dataset.q.indexOf(v) > -1; r.hidden = !hit; any = any || hit; });
          var e = m.querySelector('#mlist .empty.search-empty'); if (!any && !e) m.querySelector('#mlist').insertAdjacentHTML('beforeend', '<div class="empty search-empty"><span>No members match that search.</span></div>'); else if (any && e) e.remove();
        });
      }
    };
  }

  function addMemberSheet() {
    sheet('<h2>Add a member</h2><p class="muted small">Creates a login with a temporary password you can send them.</p>' +
      '<form id="am" class="stack" novalidate>' +
        '<div class="field"><label for="am-name">Full name</label><input id="am-name" autocomplete="off" required placeholder="Eeman Dar"></div>' +
        '<div class="field"><label for="am-email">Email</label><input id="am-email" type="email" autocomplete="off" required placeholder="eeman@example.com"></div>' +
        '<div class="field"><label for="am-phone">WhatsApp number <span class="muted">(optional)</span></label><input id="am-phone" type="tel" inputmode="tel" placeholder="03xx xxxxxxx"></div>' +
        '<div class="field"><label for="am-college">Medical college / university</label><input id="am-college" placeholder="King Edward Medical University"></div>' +
        '<div class="field"><label for="am-level">Current level</label><select id="am-level">' + levelOptions('') + '</select></div>' +
        '<div class="field"><span class="small" style="font-weight:600">Programmes</span>' + trackChips(['original'], 'am-track') + '</div>' +
        (isOwner() ? '<div class="field"><label for="am-mentor">Mentor</label><select id="am-mentor">' + mentorOptions(me.id) + '</select></div>' : '') +
        '<p class="error" id="am-err" role="alert" hidden></p>' +
        '<button class="btn btn-primary btn-block" type="submit">Create member</button>' +
        '<button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Cancel</button>' +
      '</form>',
      function (el, close) {
        var f = el.querySelector('#am'), err = el.querySelector('#am-err');
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var v = function (id) { return el.querySelector('#' + id).value.trim(); };
          var tracks = [].slice.call(el.querySelectorAll('input[name="am-track"]:checked')).map(function (c) { return c.value; });
          var show = function (msg) { err.textContent = msg; err.hidden = false; };
          if (!v('am-name')) return show('Enter the member’s name.');
          if (!/.+@.+\..+/.test(v('am-email'))) return show('Enter a valid email address.');
          if (v('am-phone') && !waNumber(v('am-phone'))) return show('Enter a full WhatsApp number, like 0339 5888444, or leave it empty.');
          if (!tracks.length) return show('Choose at least one programme.');
          S.addMember({ name: v('am-name'), email: v('am-email'), phone: v('am-phone'), college: v('am-college'), level: v('am-level'), tracks: tracks }, isOwner() ? v('am-mentor') : me.id)
            .then(function (res) { close(); credentialsSheet(res.user, res.password, 'Member added', 'Send these details to the student by WhatsApp or email.'); }, function (x) { show(x.message); });
        });
      });
  }

  async function vMember(id) {
    var got = await Promise.all([S.member(id), S.mentors(), S.submissions(id)]), u = got[0]; mentorCache = got[1];
    if (!u) return { html: '<a class="back" href="#members">' + ic('back', 'chev') + 'Members</a><div class="glass empty"><b>Member not found</b><span>They may have been removed.</span></div>' };
    var subs = got[2], fn = short(u.name), pend = changes[id] || [];
    var html = '<a class="back" href="#members">' + ic('back', 'chev') + 'Members</a>' +
      (pend.length ? '<div class="glass card change-bar"><div class="li-main"><b>Let ' + esc(fn) + ' know?</b><span class="small muted">' + esc(pend.join(' · ')) + '</span></div>' +
        '<div class="row"><button class="btn btn-quiet btn-sm" type="button" id="ch-skip">Not now</button><button class="btn btn-wa btn-sm" type="button" id="ch-send">' + ic('wa') + 'Notify</button></div></div>' : '') +
      '<div class="glass card stack">' +
        '<div class="row"><span class="avatar lg warm">' + initials(u.name) + '</span><div class="li-main"><h2>' + esc(u.name) + '</h2><span class="small muted">' + esc(u.email) + (u.phone ? ' · ' + esc(u.phone) : '') + '</span></div></div>' +
        '<div class="row wrap wa-row">' + (waNumber(u.phone) ? waButton(waNumber(u.phone), 'Hi ' + fn + ', this is ' + short(me.name) + ' from Researchette.', 'WhatsApp ' + fn) : '') +
          (can('chat') ? '<a class="btn btn-glass" href="#chat-' + esc(u.id) + '">' + ic('msgs') + 'Chat</a>' : '') +
          (can('edit_members') ? (waNumber(u.phone) ? '<button class="btn btn-quiet btn-sm" type="button" id="edit-phone">Change number</button>' : '<button class="btn btn-glass btn-sm" type="button" id="edit-phone">' + ic('wa') + 'Add WhatsApp number</button>') : '') + '</div>' +
        '<form class="row wrap" id="phone-form" hidden><input id="phone-in" type="tel" inputmode="tel" placeholder="03xx xxxxxxx" value="' + esc(u.phone || '') + '" style="flex:1;min-width:180px" aria-label="WhatsApp number"><button class="btn btn-primary btn-sm" type="submit">Save</button></form>' +
        '<div class="chips">' + [u.college, u.level, 'Joined ' + rel(u.joined)].filter(Boolean).map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>' +
        (u.topic ? '<p><span class="small muted">Study topic</span><br>' + esc(u.topic) + '</p>' : '') +
      '</div>' +
      '<div class="glass card stack">' +
        (isOwner() ? '<div class="field"><label for="mentor-sel">Mentor</label><select id="mentor-sel">' + mentorOptions(u.mentorId) + '</select></div>'
          : '<p><span class="small muted">Mentor</span><br>' + esc(u.mentor ? u.mentor.name : 'No mentor yet') + '</p>') +
        (can('edit_members') ? '<div class="field"><span class="small" style="font-weight:600">Programmes</span><span class="small muted">Tick the programmes this member can follow. Progress is kept if you untick one.</span>' + trackChips(u.tracks, 'm-track') + '</div>'
          : '<p><span class="small muted">Programmes</span><br>' + esc(u.tracks.map(function (t) { return T(t).name; }).join(', ')) + '</p>') +
      '</div>' +
      (isOwner() && u.perms ? '<div class="glass card stack"><div><h3>What ' + esc(fn) + ' can do</h3><p class="small muted">Only you and the other owners can change this.</p></div>' +
        toggles([
          ['chat', 'Chat with their mentor', 'Send messages in the portal chat.', u.perms.chat],
          ['choose_programme', 'Choose their own programmes', 'Otherwise they can only follow the programmes you tick above.', u.perms.choose_programme],
          ['active', 'Account active', 'Pausing logs them out and stops them logging in. Nothing is deleted.', u.active]
        ], 'macc') + '</div>' : '') +
      u.tracks.map(function (t, i) {
        var st = u.states[t], done = st.filter(function (x) { return x.status === 'approved'; }).length;
        return '<details class="glass card track-sec"' + (i === 0 ? ' open' : '') + '><summary><div class="li-main"><h3>' + esc(T(t).name) + (t === u.activeTrack ? ' <span class="pill approved">Current</span>' : '') + '</h3><span class="small muted">' + done + ' of ' + st.length + ' steps approved</span></div>' + ic('chev', 'chev down') + '</summary>' +
          '<div class="stack" style="margin-top:14px">' + dots(st) + roadmapList(t, st, function (x) { return x.submission ? '#review-' + x.submission.id : ''; }) + '</div></details>';
      }).join('') +
      '<div class="glass card stack">' +
        '<h3>Account</h3>' +
        '<div class="account-actions">' + (can('passwords') ? '<button class="btn btn-glass btn-sm" type="button" id="reset-pw">Reset password</button><button class="btn btn-glass btn-sm" type="button" id="set-pw">Set a password</button>' : '') +
          (can('add_members') ? '<button class="btn btn-danger btn-sm" type="button" id="remove">Remove member</button>' : '') + '</div>' +
        (can('passwords') ? '' : '<p class="small muted">Password resets are handled by Zain and Taimoor.</p>') +
        '<p class="small muted">' + subs.length + ' submission' + (subs.length === 1 ? '' : 's') + ' in total.</p>' +
      '</div>';
    return {
      html: html, mount: function (m) {
        if (pend.length) {
          m.querySelector('#ch-skip').addEventListener('click', function () { delete changes[id]; render(); });
          m.querySelector('#ch-send').addEventListener('click', function () {
            var msg = 'Hi ' + fn + ', a quick update on your Researchette account:\n' + pend.map(function (c) { return '• ' + c; }).join('\n') + '\n\nLog in to see it: ' + portalUrl();
            delete changes[id]; render(); notifySheet(u, 'Notify ' + fn, msg);
          });
        }
        var note = function (c) { (changes[id] = changes[id] || []).push(c); };
        var f = m.querySelector('#phone-form'), ep = m.querySelector('#edit-phone');
        if (ep) ep.addEventListener('click', function () { f.hidden = false; f.querySelector('input').focus(); });
        bindToggles(m, 'macc', function (k, on, input) {
          var data = k === 'active' ? { active: on } : { perms: {} }; if (k !== 'active') data.perms[k] = on;
          S.memberAccess(id, data).then(function () { toast('Saved'); }, function (e) { input.checked = !on; toast(e.message); });
        });
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var v = f.querySelector('input').value;
          if (v.trim() && !waNumber(v)) { toast('Enter a full number, like 0339 5888444'); return; }
          S.setPhone(id, v).then(function () { toast(v.trim() ? 'Number saved' : 'Number removed'); render(); });
        });
        var ms = m.querySelector('#mentor-sel'); if (ms) ms.addEventListener('change', function () {
          var v = this.value;
          S.assignMentor(id, v).then(function () { toast(v ? 'Assigned to ' + mentorName(v) : 'Mentor removed'); note(v ? 'Your mentor is now ' + mentorName(v) : 'Your mentor assignment was removed'); render(); });
        });
        m.querySelectorAll('input[name="m-track"]').forEach(function (c) {
          c.addEventListener('change', function () {
            var t = [].slice.call(m.querySelectorAll('input[name="m-track"]:checked')).map(function (x) { return x.value; });
            if (!t.length) { c.checked = true; toast('Keep at least one programme'); return; }
            S.setTracks(id, t).then(function () { toast(c.checked ? T(c.value).name + ' added' : T(c.value).name + ' removed'); note(c.checked ? T(c.value).name + ' programme added' : T(c.value).name + ' programme removed'); render(); });
          });
        });
        var rp = m.querySelector('#reset-pw'); if (rp) rp.addEventListener('click', function () {
          sheet('<h2>Reset ' + esc(fn) + '’s password?</h2><p class="muted">A new temporary password is created and the old one stops working.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-primary" type="button" id="yes" style="flex:1">Reset</button></div>',
            function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.resetPassword(id).then(function (res) { close(); credentialsSheet(res.user, res.password, 'Password reset', 'Send the new password to the student.'); }); }); });
        });
        var sp = m.querySelector('#set-pw'); if (sp) sp.addEventListener('click', function () {
          sheet('<h2>Set a password for ' + esc(fn) + '</h2><form id="sp" class="stack" novalidate><div class="field"><label for="sp-in">New password</label><div class="pw"><input id="sp-in" type="text" autocomplete="off" placeholder="At least 8 characters"></div></div><p class="error" id="sp-err" role="alert" hidden></p><button class="btn btn-primary btn-block" type="submit">Save password</button><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Cancel</button></form>',
            function (el, close) {
              el.querySelector('#sp').addEventListener('submit', function (e) {
                e.preventDefault();
                S.setPassword(id, el.querySelector('#sp-in').value).then(function (res) { close(); credentialsSheet(res.user, res.password, 'Password changed', 'Send the new password to the student.'); },
                  function (x) { var er = el.querySelector('#sp-err'); er.textContent = x.message; er.hidden = false; });
              });
            });
        });
        var rm = m.querySelector('#remove'); if (rm) rm.addEventListener('click', function () {
          sheet('<h2>Remove ' + esc(u.name) + '?</h2><p class="muted">Their login stops working and all their submissions and feedback are deleted. This can’t be undone.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-danger" type="button" id="yes" style="flex:1">Remove</button></div>',
            function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.removeMember(id).then(function () { close(); toast(u.name + ' removed'); go('members'); }); }); });
        });
      }
    };
  }

  /* ---------- admin: applications ---------- */
  var appFilter = 'new';
  async function vApplications() {
    var all = await S.applications();
    var count = function (s) { return all.filter(function (a) { return a.status === s; }).length; };
    var idx = { new: 0, approved: 1, declined: 2 }[appFilter];
    var list = all.filter(function (a) { return a.status === appFilter; });
    var html = '<section class="page-head"><span class="eyebrow">From the website</span><h1>Applications</h1></section>' +
      '<div class="seg" id="afilter" style="--n:3;--i:' + idx + '"><button type="button" data-f="new">New · ' + count('new') + '</button><button type="button" data-f="approved">Approved · ' + count('approved') + '</button><button type="button" data-f="declined">Declined · ' + count('declined') + '</button></div>';
    if (!list.length) html += '<div class="glass empty">' + ic('mail') + '<span>' + (appFilter === 'new' ? 'No new applications. They’ll appear here when students apply on the website.' : 'Nothing here yet.') + '</span></div>';
    html += list.map(function (a) {
      return '<article class="glass card app-card" data-id="' + esc(a.id) + '">' +
        '<div class="row spread wrap"><div class="row"><span class="avatar">' + initials(a.name) + '</span><div class="li-main"><h3>' + esc(a.name) + '</h3><span class="small muted">' + rel(a.createdAt) + '</span></div></div>' + pill(a.status) + '</div>' +
        '<p class="small muted">' + [a.college, a.level, a.experience].filter(Boolean).map(esc).join(' · ') + '</p>' +
        (a.goals && a.goals.length ? '<div class="chips">' + a.goals.map(function (g) { return '<span class="chip">' + esc(g) + '</span>'; }).join('') + '</div>' : '') +
        (a.why ? '<p class="quote">' + esc(a.why) + '</p>' : '') +
        '<p class="small"><span class="muted">Contact:</span> ' + esc(a.email) + (a.phone ? ' · ' + esc(a.phone) : '') + '</p>' +
        (waNumber(a.phone) ? '<div class="row">' + waButton(waNumber(a.phone), 'Hi ' + short(a.name) + ', thank you for applying to Researchette!', 'WhatsApp ' + short(a.name), 'btn-sm') + '</div>' : '') +
        (a.status === 'approved' && a.userId ? '<a class="small" href="#member-' + esc(a.userId) + '">Open member page →</a>' : '') +
        (a.status === 'new' ?
          '<div class="row spread wrap" style="padding-top:12px;border-top:1px solid var(--line)"><label class="switch"><input type="checkbox" data-paid ' + (a.paid ? 'checked' : '') + '><span class="t"></span>Payment received</label>' +
          '<div class="row"><button class="btn btn-quiet btn-sm" type="button" data-decline>Decline</button><button class="btn btn-primary btn-sm" type="button" data-approve>Approve &amp; create login</button></div></div>' : '') +
      '</article>';
    }).join('');
    return {
      html: html, mount: function (m) {
        m.querySelectorAll('#afilter button').forEach(function (b, i) {
          b.classList.toggle('on', i === idx);
          b.addEventListener('click', function () { appFilter = b.dataset.f; m.querySelector('#afilter').style.setProperty('--i', i); setTimeout(render, 180); });
        });
        m.querySelectorAll('.app-card').forEach(function (card) {
          var id = card.dataset.id, a = all.filter(function (x) { return x.id === id; })[0];
          var paid = card.querySelector('[data-paid]');
          if (!paid) return;
          paid.addEventListener('change', function () { S.setPaid(id, paid.checked).then(function () { a.paid = paid.checked; toast(paid.checked ? 'Marked as paid' : 'Marked as unpaid'); }); });
          card.querySelector('[data-decline]').addEventListener('click', function () {
            sheet('<h2>Decline ' + esc(a.name) + '?</h2><p class="muted">The application moves to Declined. No account is created.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-primary" type="button" id="yes" style="flex:1">Decline</button></div>',
              function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.decline(id).then(function () { close(); toast('Application declined'); render(); }); }); });
          });
          card.querySelector('[data-approve]').addEventListener('click', function () {
            if (!a.paid) {
              sheet('<h2>Payment not marked yet</h2><p class="muted">You haven’t marked payment as received for ' + esc(a.name) + '. Create the login anyway?</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Go back</button><button class="btn btn-primary" type="button" id="yes" style="flex:1">Create login</button></div>',
                function (el, close) { el.querySelector('#yes').addEventListener('click', function () { close(); approve(a); }); });
            } else approve(a);
          });
        });
      }
    };
  }
  function approve(a) {
    S.approveApplication(a.id, me.id).then(function (res) {
      credentialsSheet(res.user, res.password, 'Welcome aboard', 'They’re assigned to you, with programmes matching their application. You can change both on their member page. Send these details by WhatsApp or email.');
    }, function (e) { toast(e.message); });
  }


  /* ---------- install-app bar (phones) ---------- */
  var deferredPrompt = null, bar = null;
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var phone = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  function dismissedRecently() { return Date.now() - (+store('rt-install-dismissed') || 0) < 7 * 864e5; }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(function () {});
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; showInstall(); });
  addEventListener('appinstalled', function () { hideInstall(false); toast('Researchette installed'); });
  function showInstall() {
    if (standalone || !phone || bar || dismissedRecently() || (!deferredPrompt && !ios)) return;
    bar = document.createElement('div'); bar.className = 'install-bar glass'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Install the app');
    bar.innerHTML = '<img src="assets/icons/icon-192.png" alt=""><div class="txt"><b>Install Researchette</b><span>' +
      (deferredPrompt ? 'One tap from your home screen.' : 'Tap Share, then “Add to Home Screen”.') + '</span></div>' +
      (deferredPrompt ? '<button class="btn btn-primary btn-sm" type="button" id="inst">Install</button>' : '') +
      '<button class="x" type="button" aria-label="Not now">×</button>';
    document.body.appendChild(bar);
    var ib = bar.querySelector('#inst');
    if (ib) ib.addEventListener('click', function () {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (c) { deferredPrompt = null; hideInstall(c.outcome !== 'accepted'); });
    });
    bar.querySelector('.x').addEventListener('click', function () { hideInstall(true); });
    placeInstall();
  }
  function hideInstall(remember) {
    if (remember) store('rt-install-dismissed', String(Date.now()));
    if (!bar) return;
    var b = bar; bar = null; b.classList.add('out'); setTimeout(function () { b.remove(); }, 350);
  }
  function placeInstall() {
    if (!bar) return;
    var t = document.querySelector('.tabs.bottom'), on = t && getComputedStyle(t).display !== 'none';
    bar.style.setProperty('--install-offset', on ? (t.offsetHeight + 10) + 'px' : '0px');
  }
  if (ios) setTimeout(showInstall, 1200);

  render();
})();
