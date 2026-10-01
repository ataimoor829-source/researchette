/* Researchette portal: login, member portal and admin (mentor) portal in one page.
   Routes live in the URL hash: #login, #today, #roadmap, #step-3, #feedback, #chat,
   #overview, #reviews, #review-<id>, #members, #member-<id>, #applications, #messages, #chat-<member id>,
   #team, #admin-<id>, #lessons, #lesson-<track>-<n>, #research (owners). */
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
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    alert: '<path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/>',
    wa: '<path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/><path d="M9 9.5c.3 1.8 1.7 3.7 3.5 4.6l1.2-1 1.8.8-.4 1.6c-3 .1-6.9-3.4-7-6.6l1.5-.5.8 1.7z"/>',
    done: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>',
    msgs: '<path d="M14 9a2 2 0 0 1-2 2H6l-3 3V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-3-3h-6a2 2 0 0 1-2-2v-1"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4M5 17v3M6.5 18.5h-3"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="3"/><path d="M11 18h2"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6.5a2.5 2.5 0 0 0 0 5H19"/><path d="M8 7h7M8 11h5"/>',
    paper: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>'
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
  function wave() { var h = new Date().getHours(); return h < 12 ? '☀️' : h < 18 ? '👋' : '🌙'; }
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

  /* a short burst of confetti from an element (or the middle of the screen); skipped for reduced motion */
  function confetti(from) {
    if (reduce || !document.body.animate) return;
    var r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    var x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, box = document.createElement('div'), cols = ['#3448D8', '#0B9E8C', '#F2B43A', '#DD4460', '#8FA0FF', '#5CF2D8'];
    box.className = 'confetti'; box.setAttribute('aria-hidden', 'true'); document.body.appendChild(box);
    for (var i = 0; i < 34; i++) {
      var p = document.createElement('i'), a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.3, v = 160 + Math.random() * 220;
      var dx = Math.cos(a) * v, dy = Math.sin(a) * v, rot = (Math.random() - .5) * 720;
      p.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;background:' + cols[i % cols.length] + (i % 3 ? '' : ';border-radius:50%;width:7px;height:7px');
      box.appendChild(p);
      p.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx * .75 + 'px), calc(-50% + ' + dy * .75 + 'px)) rotate(' + rot * .6 + 'deg)', opacity: 1, offset: .55 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + (dy + 260) + 'px)) rotate(' + rot + 'deg)', opacity: 0 }],
        { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
    }
    setTimeout(function () { box.remove(); }, 1800);
  }
  /* numbers that count up to their value when a screen opens */
  function countUp(root) {
    root.querySelectorAll('[data-count]').forEach(function (el) {
      var end = +el.dataset.count; if (reduce || !end) return;
      var t0 = null; el.textContent = '0';
      requestAnimationFrame(function step(t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); });
    });
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
  function canViewLessons() { return can('view_lessons') || can('edit_lessons'); }
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
    member: [{ id: 'today', label: 'Today', icon: 'today' }, { id: 'roadmap', label: 'Roadmap', icon: 'map' }, { id: 'basics', label: 'Writing', icon: 'book' }, { id: 'feedback', label: 'Feedback', icon: 'chat' }, { id: 'chat', label: 'Chat', icon: 'msgs', badge: 'unread' }],
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
      return '<a href="#' + t.id + '" data-tab="' + t.id + '" data-label="' + t.label + '">' + ic(t.icon) + '<span>' + t.label + '</span>' + (t.badge ? '<span class="badge" data-badge="' + t.badge + '" hidden></span>' : '') + '</a>';
    }).join('') + '<span class="ind" aria-hidden="true"></span></nav>';
  }
  function ensureShell() {
    var key = shellKey();
    if (app.dataset.shell === key) return;
    app.dataset.shell = key;
    app.classList.toggle('dash', true);   // wide screens: icon rail + glass panels (dash.css)
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
  /* phones, members: the top bar slides away while you scroll down and comes back as soon as you scroll up */
  (function () {
    var phone = matchMedia('(max-width: 760px)'), lastY = scrollY, hidden = false, ticking = false, root = document.documentElement;
    function set(h) { if (h !== hidden) { hidden = h; root.classList.toggle('bar-hide', h); } }
    function check() {
      ticking = false;
      var y = Math.max(0, scrollY), d = y - lastY;
      if (!me || me.role !== 'member' || !phone.matches || y < 80) { set(false); lastY = y; return; }
      if (d > 6) { set(true); lastY = y; } else if (d < -6) { set(false); lastY = y; }
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } }, { passive: true });
  })();
  var currentTab = null;

  function accountSheet() {
    var t = store('rt-portal-theme') || 'system', idx = { system: 0, light: 1, dark: 2 }[t] || 0;
    sheet(
      '<div class="row"><span class="avatar lg ' + (me.role === 'admin' ? '' : 'warm') + '">' + initials(me.name) + '</span><div><h3>' + esc(me.name) + '</h3><p class="small muted">' + esc(me.email) + '</p>' + (me.college ? '<p class="small muted">' + esc(me.college) + '</p>' : '') + '</div></div>' +
      '<div class="field"><span class="small muted">Appearance</span><div class="seg" id="theme-seg" style="--n:3;--i:' + idx + '"><button type="button" data-v="system">System</button><button type="button" data-v="light">Light</button><button type="button" data-v="dark">Dark</button></div></div>' +
      (me.role === 'member' && can('chat') ? '<button class="btn btn-primary btn-block" type="button" id="to-chat">' + ic('msgs') + 'Message your mentor</button>' : '') +
      (isOwner() ? '<button class="btn btn-glass btn-block" type="button" id="team-btn">Team & permissions</button>' : '') +
      (me.role === 'admin' && canViewLessons() ? '<button class="btn btn-glass btn-block" type="button" id="lessons-btn">' + (can('edit_lessons') ? 'Edit lessons' : 'Lessons') + '</button>' : '') +
      (isOwner() ? '<button class="btn btn-glass btn-block" type="button" id="apps">Connected apps</button>' : '') +
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
      if ((r === 'applications' && !can('applications')) || ((r === 'messages' || /^chat-/.test(r)) && !can('chat')) || ((r === 'team' || r === 'research' || /^admin-/.test(r)) && !isOwner()) || ((r === 'lessons' || /^lesson-/.test(r)) && !canViewLessons())) { r = 'overview'; setHash(r); }
      var lm = /^lesson-([a-z]+)-(\d+)$/.exec(r);
      if (/^review-/.test(r)) { view = vReview(r.slice(7)); tab = 'reviews'; }
      else if (r === 'team') { view = vTeam(); tab = 'overview'; }
      else if (r === 'lessons') { view = vLessons(); tab = 'overview'; }
      else if (r === 'research') { view = vResearch(); tab = 'overview'; }
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
      else if (r === 'basics') { view = vBasics(); tab = r; }
      else if (/^basics-/.test(r)) { view = vBasic(r.slice(7)); tab = 'basics'; }
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
    main.querySelectorAll('.list, .rise').forEach(function (l) { [].forEach.call(l.children, function (c, i) { c.style.setProperty('--si', Math.min(i, 10)); }); });
    main.classList.remove('view-enter'); void main.offsetWidth; main.classList.add('view-enter');
    countUp(main);
    scrollTo({ top: 0, behavior: 'instant' });
    if (v.mount) v.mount(main);
    placeInstall();
    if (main.querySelector('[data-prog]')) { if (window.requestIdleCallback) requestIdleCallback(preloadProgress, { timeout: 1500 }); else setTimeout(preloadProgress, 600); }
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
      { icon: 'map', tone: 'amber', hand: 'watch it fill up', title: 'See how far you’ve come', text: '<b>Roadmap</b> shows every step, <b>Writing</b> teaches how to write each part of a paper, and <b>Feedback</b> keeps all your mentor’s comments in one place.' },
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
      '<circle class="track" cx="38" cy="38" r="32"/><circle class="fill" cx="38" cy="38" r="32" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (reduce ? off : c).toFixed(1) + '" data-off="' + off.toFixed(1) + '"/></svg><b><span><span data-count="' + done + '">' + done + '</span>/' + total + '</span></b></div>';
  }
  function animateRing(root) { var f = root.querySelector('.ring .fill'); if (f) requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.strokeDashoffset = f.dataset.off; }); }); }
  function progSwitch(t) {
    return '<button class="prog-switch glass" type="button" data-prog><span class="small muted">Programme</span><b>' + esc(T(t).name) + '</b>' + ic('chev', 'chev down') + '</button>';
  }
  function bindProg(root) { root.querySelectorAll('[data-prog]').forEach(function (b) { b.addEventListener('click', programmeSheet); }); }

  /* members choose (or start) a programme; mentors can also assign them */
  /* programme picker: opens at once from what the page already knows; progress numbers fill in when they
     arrive (usually already loaded in the background, see preloadProgress) */
  var progCache = null, progAt = 0;
  function preloadProgress() {
    if (me && me.role === 'member' && Date.now() - progAt > 20000) { progAt = Date.now(); S.progress(me.id).then(function (p) { progCache = p; }, function () { progAt = 0; }); }
  }
  function programmeSheet() {
    var allowed = function (t) { return can('choose_programme') || (me.tracks || []).indexOf(t.id) > -1; };
    var list = C.tracks.filter(allowed).concat(C.tracks.filter(function (t) { return !allowed(t); }));
    var who = me.mentorName ? short(me.mentorName) : 'Zain';
    function row(t, prog) {
      if (!allowed(t)) return '<span class="sicon locked">' + ic('lock') + '</span><div class="li-main"><span class="li-title">' + esc(t.name) + '</span><span class="li-sub">' + t.steps.length + ' steps · ask ' + esc(who) + ' to unlock it</span></div><div class="li-end"><span class="pill ask">' + ic('msgs') + 'Ask ' + esc(who) + '</span></div>';
      var p = prog && prog[t.id], on = t.id === me.activeTrack;
      var sub = !prog ? t.steps.length + ' steps' : p ? p.done + ' of ' + p.total + ' steps approved' : t.steps.length + ' steps · not started';
      return '<span class="sicon ' + (on ? 'current' : p ? 'approved' : 'locked') + '">' + (on ? ic('check') : t.steps.length) + '</span>' +
        '<div class="li-main"><span class="li-title">' + esc(t.name) + '</span><span class="li-sub">' + esc(sub) + '</span></div>' +
        '<div class="li-end">' + (on ? '<span class="pill approved">Current</span>' : '<span class="pill">' + (!prog || p ? 'Switch' : 'Start') + '</span>') + '</div>';
    }
    sheet('<h2>Choose a programme</h2><p class="muted small">Each programme has its own step-by-step roadmap. Your progress in each one is saved.</p>' +
      (list.some(function (t) { return !allowed(t); }) ? '<p class="small muted">Want to do another one? Tap a locked programme to ask ' + esc(who) + ' to unlock it for you.</p>' : '') +
      '<div class="glass list" id="prog-list">' + list.map(function (t) { return '<button class="li li-btn' + (allowed(t) ? '' : ' locked-prog') + '" type="button" ' + (allowed(t) ? 'data-t' : 'data-ask') + '="' + t.id + '">' + row(t, progCache) + '</button>'; }).join('') +
      '</div><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Close</button>',
      function (el, close) {
        var busy = false;
        function fill(prog) { el.querySelectorAll('[data-t]').forEach(function (b) { if (!b.classList.contains('busy')) b.innerHTML = row(T(b.dataset.t), prog); }); }
        // refresh the numbers in the background (instant when they were preloaded)
        S.progress(me.id).then(function (p) { progCache = p; progAt = Date.now(); if (el.isConnected) fill(p); }, function () {});
        el.querySelectorAll('[data-ask]').forEach(function (b) {
          b.addEventListener('click', function () {
            var name = T(b.dataset.ask).name, text = 'Hi ' + who + '! Could you please unlock the ' + name + ' programme for me? 😊';
            close();
            if (can('chat')) { chatContext = 'Unlock a programme: ' + name; chatDraft = text; go('chat'); }
            else window.open(waLink('923395888444', text), '_blank', 'noopener');
          });
        });
        el.querySelectorAll('[data-t]').forEach(function (b) {
          b.addEventListener('click', function () {
            var id = b.dataset.t;
            if (id === me.activeTrack) { close(); return; }
            if (busy) return; busy = true;
            b.classList.add('busy'); var pill = b.querySelector('.li-end'); if (pill) pill.innerHTML = '<span class="pill review">Switching…</span>';
            S.setActiveTrack(me.id, id).then(function (u) { rememberMe(u); progAt = 0; close(); toast('Now on: ' + T(id).name); go('today'); },
              function (e) { busy = false; b.classList.remove('busy'); fill(progCache); toast(e.message); });
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
        mount: function (m) { animateRing(m); bindProg(m); if (store('rt-done-' + me.id + '-' + t) === null) { store('rt-done-' + me.id + '-' + t, '1'); setTimeout(function () { confetti(m.querySelector('.stamp')); }, 700); } } };
    }
    var d = stepOf(t, cur.step);
    var summary = '<div class="glass card today-head">' + ring(done, total) + '<div class="txt"><span class="small muted">' + esc(tr.name) + '</span><h3>' + done + ' of ' + total + ' steps approved</h3><span class="small muted">Today: Step ' + cur.step + ' · ' + esc(d.title) + '</span></div></div>';
    var body = stepCard(t, cur.step, st);
    var help = can('chat') ? '<div class="glass card help-card m-only"><div><h3>Stuck on this step?</h3><p class="small muted">Ask your mentor in the chat. They’ll see which step you’re on.</p></div>' +
      '<button class="btn btn-primary" type="button" data-ask>' + ic('msgs') + 'Ask your mentor</button></div>' : '';
    /* wide screens: a calm dashboard (three tiles, today's step, and a slim side panel); phones keep the summary card */
    var inReview = st.filter(function (x) { return x.status === 'review'; }).length, fix = st.filter(function (x) { return x.status === 'revision'; }).length;
    var tiles = '<div class="tiles three w-only">' +
      '<div class="tile glass c-teal"><div class="tile-h"><span>Your progress</span><i>' + ic('done') + '</i></div>' + miniGauge(done, total, '#0B9E8C') + '<div class="tile-n"><b data-count="' + done + '">' + done + '</b><small>of ' + total + ' steps approved</small></div></div>' +
      '<a class="tile glass c-pen" href="#stepcard" data-jump><div class="tile-h"><span>Working on</span><i>' + ic('pen') + '</i></div><p class="tile-t">' + esc(d.title) + '</p><div class="tile-n"><b>Step ' + cur.step + '</b><small>' + d.minutes + ' min</small></div></a>' +
      (fix ? '<a class="tile glass c-rose" href="#feedback"><div class="tile-h"><span>Needs changes</span><i>' + ic('alert') + '</i></div><p class="tile-t">Your mentor left notes to fix.</p><div class="tile-n"><b>' + fix + '</b><small>step' + (fix > 1 ? 's' : '') + '</small></div></a>'
        : '<a class="tile glass c-amber" href="#feedback"><div class="tile-h"><span>With your mentor</span><i>' + ic('clock') + '</i></div><p class="tile-t">' + (inReview ? 'Being reviewed now.' : 'Nothing waiting for review.') + '</p><div class="tile-n"><b>' + inReview + '</b><small>in review</small></div></a>') +
    '</div>';
    var next = st.filter(function (x) { return x.step > cur.step; }).slice(0, 3);
    var side = '<aside class="ov-side stack w-only">' +
      '<div class="ov-me"><span class="avatar warm">' + initials(me.name) + '</span><div class="li-main"><b>' + esc(me.name) + '</b><span class="small muted">' + esc(me.college || 'Member') + '</span></div><button class="ov-more" type="button" data-acct aria-label="Account and settings">•••</button></div>' +
      progSwitch(t) +
      (can('chat') ? '<div class="glass card mv-mentor"><span class="sc-ic">' + ic('msgs') + '</span><div><h3>' + (me.mentorName ? esc(short(me.mentorName)) : 'Your mentor') + '</h3><p class="small muted">Stuck? Ask in the chat. They’ll see which step you’re on.</p></div><button class="btn btn-primary btn-sm btn-block" type="button" data-ask>Ask your mentor</button></div>' : '') +
      (next.length ? '<div class="phase-title"><h3>Up next</h3><a class="small" href="#roadmap">Roadmap</a></div><div class="ov-wait">' + next.map(function (x) {
        var s = stepOf(t, x.step);
        return '<div class="glass wait">' + sicon(x.status, x.step) + '<div class="li-main"><b>' + esc(s.title) + '</b><span class="small muted">Step ' + x.step + ' · ' + s.minutes + ' min</span></div></div>';
      }).join('') + '</div>' : '') +
    '</aside>';
    var mhead = '<div class="ov-top w-only"><div><h1>' + greet() + ', ' + first(me.name) + ' ' + wave() + '</h1><p class="muted">' + today() + ' · ' + esc(tr.name) + '</p></div></div>';
    return { html: '<div class="ov mv"><div class="ov-main stack-lg"><div class="m-only stack-lg">' + head + summary + '</div>' + mhead + tiles + body.html + help + '</div>' + side + '</div>', mount: function (m) {
      animateRing(m); bindProg(m); body.mount(m);
      m.querySelectorAll('[data-ask]').forEach(function (b) { b.addEventListener('click', function () { chatContext = tr.name + ' · Step ' + cur.step + ': ' + d.title; go('chat'); }); });
      m.querySelectorAll('[data-acct]').forEach(function (b) { b.addEventListener('click', accountSheet); });
      m.querySelectorAll('[data-jump]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var c = m.querySelector('#stepcard'); if (c) c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }); });
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
    } else if (v.type === 'letters') {
      /* one card per letter of a memory aid (PICO, FINER): letter, word, the plain question, a good and a bad example */
      body = '<div class="viz-letters">' + v.items.map(function (x) {
        return '<div class="lt"><span class="lt-l" aria-hidden="true">' + esc(x[0]) + '</span><div class="lt-t"><b>' + esc(x[1]) + '</b><span>' + esc(x[2]) + '</span>' +
          (x[3] ? '<small class="ok">' + esc(x[3]) + '</small>' : '') + (x[4] ? '<small class="no">' + esc(x[4]) + '</small>' : '') + '</div></div>';
      }).join('') + '</div>';
    } else if (v.type === 'funnel') {
      /* a big idea narrowing down to a small one (or any shape, when each level gives its own width) */
      var fl = v.levels.length;
      body = '<div class="viz-funnel">' + v.levels.map(function (x, i) {
        var w = x[2] || Math.round(100 - (45 * i) / Math.max(1, fl - 1));
        return '<div class="fl' + (i === fl - 1 && !x[2] ? ' last' : '') + '" style="--w:' + w + '%;--k:' + (i / Math.max(1, fl - 1)).toFixed(2) + '"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>';
      }).join('') + '</div>';
    } else if (v.type === 'venn') {
      /* what AND, OR and NOT do, drawn as two overlapping circles */
      body = '<div class="viz-venn">' + v.items.map(function (x) {
        var id = 'vn' + (++vennId), A = '<circle cx="62" cy="50" r="36"/>', B = '<circle cx="98" cy="50" r="36"/>', fill;
        if (x.op === 'OR') fill = '<g class="on">' + A + B + '</g>';
        else if (x.op === 'AND') fill = '<clipPath id="' + id + '">' + A + '</clipPath><g class="on" clip-path="url(#' + id + ')">' + B + '</g>';
        else fill = '<mask id="' + id + '"><rect width="160" height="100" fill="#fff"/><circle cx="98" cy="50" r="36" fill="#000"/></mask><g class="on" mask="url(#' + id + ')">' + A + '</g>';
        return '<div class="vn"><svg viewBox="0 0 160 100" role="img" aria-label="' + esc(x.a + ' ' + x.op + ' ' + x.b + ': ' + x.note) + '">' + fill +
          '<g class="ring">' + A + B + '</g></svg><div class="vn-l"><span>' + esc(x.a) + '</span><span>' + esc(x.b) + '</span></div>' +
          '<b class="vn-op">' + esc(x.op) + '</b><code>' + esc(x.a + ' ' + x.op + ' ' + x.b) + '</code><small>' + esc(x.note) + '</small></div>';
      }).join('') + '</div>';
    } else if (v.type === 'screen') {
      /* a drawing of a website (e.g. PubMed) with numbered spots explained below it */
      var mk = {}; (v.notes || []).forEach(function (x, i) { mk[x[0]] = i + 1; });
      var m = function (k) { return mk[k] ? '<b class="mk" aria-hidden="true">' + mk[k] + '</b>' : ''; };
      body = '<div class="viz-screen" aria-hidden="true"><div class="sc-bar"><i></i><i></i><i></i><span>' + esc(v.url) + '</span></div><div class="sc-body">' +
        '<div class="sc-search"><span class="sc-box">' + esc(v.query) + m('box') + '</span><span class="sc-btn">Search' + m('button') + '</span></div>' +
        '<div class="sc-main">' + (v.filters ? '<div class="sc-filters">' + m('filters') + '<b>Filters</b>' + v.filters.map(function (f) { return '<span class="' + (f[1] ? 'on' : '') + '">' + esc(f[0]) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="sc-results"><div class="sc-count">' + esc(v.count || '') + m('count') + '</div>' + (v.results || []).map(function (r, i) {
          return '<div class="sc-r">' + (i === 0 ? m('result') : '') + '<span class="sc-t">' + esc(r) + '</span><span class="sc-a">Cite · Share · Save</span></div>';
        }).join('') + '</div></div></div></div>' +
        (v.notes ? '<ol class="sc-notes">' + v.notes.map(function (x, i) { return '<li><b class="mk">' + (i + 1) + '</b><span>' + esc(x[1]) + '</span></li>'; }).join('') + '</ol>' : '');
    } else if (v.type === 'sheet') {
      /* a small spreadsheet: one row per person, one column per question */
      var L = 'ABCDEFGHIJ';
      body = '<div class="viz-scroll"><table class="viz-sheet"><thead><tr><th></th>' + v.cols.map(function (c, i) { return '<th>' + L[i] + '</th>'; }).join('') + '</tr></thead><tbody>' +
        '<tr class="hd"><th>1</th>' + v.cols.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>' +
        v.rows.map(function (r, i) { return '<tr><th>' + (i + 2) + '</th>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
        (v.note ? '<p class="small muted">' + esc(v.note) + '</p>' : '');
    } else if (v.type === 'forest') {
      /* a forest plot: each study's result as a square with a line (its range), the combined result as a diamond */
      var lo = v.min || 0.1, hi = v.max || 10, W = 300, X0 = 82, X1 = 290, rowH = 26, top = 26, n2 = v.rows.length;
      var x = function (r) { return X0 + (Math.log(r) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (X1 - X0); };
      var H = top + (n2 + 1) * rowH + 30, one = x(1).toFixed(1), svg = '';
      svg += '<line class="axis" x1="' + one + '" y1="' + (top - 8) + '" x2="' + one + '" y2="' + (H - 26) + '"/>';
      svg += '<text class="hd" x="4" y="14">' + esc(v.label || 'Study') + '</text><text class="hd" x="' + ((X0 + X1) / 2) + '" y="14" text-anchor="middle">' + esc(v.measure || 'Risk ratio') + '</text>';
      v.rows.forEach(function (r, i) {
        var y = top + i * rowH + 12, sz = 5 + (r[4] || 1) * 2;
        svg += '<text x="4" y="' + (y + 4) + '">' + esc(r[0]) + '</text><line class="ci" x1="' + x(r[2]).toFixed(1) + '" y1="' + y + '" x2="' + x(r[3]).toFixed(1) + '" y2="' + y + '"/>' +
          '<rect class="pt" x="' + (x(r[1]) - sz / 2).toFixed(1) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '"/>';
      });
      var py = top + n2 * rowH + 12, pl = v.pooled;
      svg += '<text class="b" x="4" y="' + (py + 4) + '">' + esc(v.pooledLabel || 'All studies') + '</text><polygon class="dm" points="' + [[x(pl[1]), py], [x(pl[0]), py - 7], [x(pl[2]), py], [x(pl[0]), py + 7]].map(function (q) { return q[0].toFixed(1) + ',' + q[1]; }).join(' ') + '"/>';
      svg += '<text class="lg" x="' + (x(1) - 6).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="end">' + esc(v.left || '← Treatment better') + '</text><text class="lg" x="' + (x(1) + 6).toFixed(1) + '" y="' + (H - 8) + '">' + esc(v.right || 'Control better →') + '</text>';
      body = '<svg class="viz-forest" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(v.title) + '">' + svg + '</svg>' + (v.note ? '<p class="small muted">' + esc(v.note) + '</p>' : '');
    }
    return '<figure class="viz"><figcaption>' + esc(v.title) + '</figcaption>' + body + '</figure>';
  }
  var vennId = 0;

  function stepCard(t, n, st, preview) {
    var x = st[n - 1], d = stepOf(t, n), ph = phaseOf(t, n), sub = x.submission, total = st.length;
    if (x.status === 'locked') {
      var open = st.filter(function (s) { return s.status !== 'approved'; })[0];
      return { html: '<div class="glass card locked-box">' + ic('lock') + '<h2>Step ' + n + ' · ' + esc(d.title) + '</h2><p class="muted">This step unlocks when step ' + (n - 1) + ' is approved.</p><a class="btn btn-glass" href="#step-' + t + '-' + open.step + '">Go to step ' + open.step + '</a></div>', mount: function () {} };
    }
    var tab = x.status === 'current' ? 0 : 2;
    var html = '<article class="glass card stack-lg" id="stepcard">' +
      '<div class="step-head"><div class="row spread wrap"><span class="eyebrow">' + esc(T(t).short) + ' · ' + esc(ph.name) + '</span>' + pill(x.status) + '</div>' +
      '<h2>Step ' + n + ' · ' + esc(d.title) + '</h2><div class="step-meta">' + ic('clock', 'chev') + d.minutes + ' min · ' + esc(d.summary) + '</div>' +
        (x.unlocked && !preview && x.status === 'current' && n > 1 && st[n - 2].status !== 'approved' ? '<p class="small unlocked-note">' + ic('check') + 'Your mentor unlocked this step for you, so you can start it now.</p>' : '') + '</div>' +
      '<div class="seg" role="tablist" style="--n:3;--i:' + tab + '"><button type="button" role="tab" data-t="0">Learn</button><button type="button" role="tab" data-t="1">Example</button><button type="button" role="tab" data-t="2">Task</button></div>' +
      '<div id="panel"></div></article>';

    var readKey = 'rt-read-' + me.id + '-' + t + '-' + n, quizKey = 'rt-quiz-' + me.id + '-' + t + '-' + n, lastTab = -1;
    function readSet() { try { return JSON.parse(store(readKey) || '{}'); } catch (e) { return {}; } }
    function readCount() { var r = readSet(), c = d.lesson.filter(function (l, i) { return r[i]; }).length; return c === d.lesson.length ? 'All ' + c + ' read ✓' : c + ' of ' + d.lesson.length + ' read'; }
    function panel(k) {
      if (k === 0) return '<div class="panel stack-lg">' +
        (d.intro ? '<div class="note simple"><span class="eyebrow">In simple words</span><p>' + esc(d.intro) + '</p></div>' : '') +
        (d.visuals || []).map(visual).join('') +
        '<div class="stack"><div class="row spread wrap"><span class="eyebrow">Step by step</span>' + (preview ? '' : '<span class="pt-count small muted" aria-live="polite">' + readCount() + '</span>') + '</div>' +
        (preview ? '' : '<p class="small muted pt-hint">Tap each point once you’ve read it.</p>') + '<ol class="lesson' + (preview ? '' : ' ticks') + '">' + d.lesson.map(function (l, i) {
          var on = !preview && readSet()[i];
          return '<li' + (preview ? '' : ' class="' + (on ? 'done' : '') + '" data-pt="' + i + '" role="checkbox" tabindex="0" aria-checked="' + !!on + '"') + '><span class="n">' + (on ? ic('check') : i + 1) + '</span><div><b>' + esc(l.h) + '</b><p>' + esc(l.p) + '</p></div></li>';
        }).join('') + '</ol></div>' +
        (d.mistakes ? '<div class="note mistakes"><span class="eyebrow">Common mistakes to avoid</span><ul>' + d.mistakes.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>' : '') +
        stepGuides(t, n) +
        '<button class="btn btn-glass" type="button" data-goto="1">See an example →</button></div>';
      if (k === 1 && !preview && store(quizKey) === null) {
        var strongFirst = Math.random() < .5, pick = function (strong) { return '<button type="button" class="ex-box ex-pick" data-strong="' + (strong ? 1 : 0) + '"><span class="lbl"></span><p>' + esc(strong ? d.example.strong : d.example.weak) + '</p></button>'; };
        return '<div class="panel ex quiz"><p class="quiz-q"><b>Quick check:</b> which one is stronger? Tap it.</p>' + pick(strongFirst) + pick(!strongFirst) +
          '<p class="quiz-msg" aria-live="polite"></p><div class="quiz-after" hidden><p class="why"><b>Why it works:</b> ' + esc(d.example.why) + '</p>' +
          ((x.status === 'current' || x.status === 'revision') ? '<button class="btn btn-primary" type="button" data-goto="2">Start the task →</button>' : '') + '</div></div>';
      }
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
        var pn = box.firstElementChild; if (pn && lastTab >= 0 && k !== lastTab) pn.classList.add(k > lastTab ? 'from-right' : 'from-left'); lastTab = k;
        box.querySelectorAll('[data-goto]').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.goto); }); });
        bindGuides(box);
        box.querySelectorAll('[data-pt]').forEach(function (li) {
          var toggle = function () {
            var r = readSet(), i = li.dataset.pt, on = !r[i];
            if (on) r[i] = 1; else delete r[i];
            store(readKey, JSON.stringify(r));
            li.classList.toggle('done', on); li.setAttribute('aria-checked', on);
            li.querySelector('.n').innerHTML = on ? ic('check') : (+i + 1);
            if (on) { li.classList.remove('pop'); void li.offsetWidth; li.classList.add('pop'); }
            box.querySelector('.pt-count').textContent = readCount();
            if (on && d.lesson.every(function (l, j) { return r[j]; })) {
              var nb = box.querySelector('[data-goto="1"]'); confetti(li.querySelector('.n'));
              if (nb) { nb.classList.remove('nudge'); void nb.offsetWidth; nb.classList.add('nudge'); }
            }
          };
          li.addEventListener('click', toggle);
          li.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
        });
        box.querySelectorAll('.ex-pick').forEach(function (b) {
          b.addEventListener('click', function () {
            var right = b.dataset.strong === '1', msg = box.querySelector('.quiz-msg');
            store(quizKey, right ? '1' : '0');
            box.querySelectorAll('.ex-pick').forEach(function (o) {
              var strong = o.dataset.strong === '1';
              o.disabled = true; o.classList.add(strong ? 'ex-strong' : 'ex-weak'); o.querySelector('.lbl').textContent = strong ? 'Strong' : 'Weak';
            });
            b.classList.add('chosen', right ? 'right' : 'wrong');
            msg.textContent = right ? 'Yes! That’s the stronger one.' : 'Not quite. The other one is stronger. Here’s why:';
            msg.className = 'quiz-msg ' + (right ? 'ok' : 'no');
            box.querySelector('.quiz-after').hidden = false;
            if (right) confetti(b);
          });
        });
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
            S.submit(me.id, t, n, ta.value.trim()).then(function () {
              store(key, null); send.classList.add('sent'); send.innerHTML = ic('check') + 'Sent!'; confetti(send);
              toast('Sent to your mentor'); setTimeout(render, 900);
            }, function (e) { toast(e.message); send.disabled = false; send.textContent = x.status === 'revision' ? 'Resubmit' : 'Submit for review'; });
          });
        }
      }
      seg.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.t); }); });
      show(tab);
      if (!preview && x.status === 'approved' && sub && store('rt-cele-' + sub.id) === null) {
        store('rt-cele-' + sub.id, '1');
        setTimeout(function () { confetti(card.querySelector('.stamp') || card.querySelector('.pill')); }, 650);
      }
    }
    return { html: html, mount: mount };
  }

  /* ---------- member: roadmap ---------- */
  function roadmapList(t, st, linkFn, endFn) {
    return T(t).phases.map(function (ph, pi) {
      var items = st.filter(function (x) { return stepOf(t, x.step).phase === ph.id; });
      var pd = items.filter(function (x) { return x.status === 'approved'; }).length;
      return '<section class="stack" style="gap:0"><div class="phase-title"><h3>Phase 0' + (pi + 1) + ' · ' + esc(ph.name) + '</h3><span class="small muted">' + pd + '/' + items.length + '</span></div><div class="glass list">' +
        items.map(function (x) {
          var d = stepOf(t, x.step), href = linkFn(x);
          var end = endFn && !href ? endFn(x) : null;
          var inner = sicon(x.status, x.step) + '<div class="li-main"><span class="li-title">' + x.step + '. ' + esc(d.title) + '</span><span class="li-sub">' + esc(d.summary) + ' · ' + d.minutes + ' min</span></div><div class="li-end">' + (end != null ? end : x.status === 'locked' ? '' : pill(x.status) + (href ? ic('chev', 'chev') : '')) + '</div>';
          return href ? '<a class="li" href="' + href + '">' + inner + '</a>' : '<div class="li"' + (x.status === 'locked' && end == null ? ' aria-disabled="true"' : '') + '>' + inner + '</div>';
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

  /* ---------- member: writing basics (assets/writing.js) ---------- */
  var W = window.RT_WRITING || [], WSTEPS = window.RT_WRITING_STEPS || {};
  function guide(id) { return W.filter(function (w) { return w.id === id; })[0]; }
  function partNo(w) { var n = 0, out = 0; W.forEach(function (x) { if (!x.intro) n++; if (x === w) out = x.intro ? 0 : n; }); return out; }
  function partsCount() { return W.filter(function (x) { return !x.intro; }).length; }
  function wordsBox(w) {
    var x = w.words; if (!x) return '';
    return '<div class="stack"><span class="eyebrow">How long should it be?</span><div class="wlim"><div><span>Minimum</span><b>' + esc(String(x.min)) + '</b></div><div class="on"><span>Ideal</span><b>' + esc(String(x.ideal)) + '</b></div><div><span>Maximum</span><b>' + esc(String(x.max)) + '</b></div></div>' +
      '<p class="small muted">In ' + esc(x.unit) + '. ' + esc(x.note || '') + '</p></div>';
  }
  function budgetTable() {
    return '<div class="stack"><span class="eyebrow">Word budget for the whole paper</span><div class="wtable" role="table"><div class="wr wh" role="row"><span role="columnheader">Part</span><span role="columnheader">Min</span><span role="columnheader">Ideal</span><span role="columnheader">Max</span></div>' +
      W.filter(function (x) { return !x.intro && x.words; }).map(function (x) {
        return '<div class="wr" role="row"><span role="cell">' + esc(x.title) + (x.words.unit === 'references' ? ' <small>(count)</small>' : '') + '</span><span role="cell">' + esc(String(x.words.min)) + '</span><span role="cell"><b>' + esc(String(x.words.ideal)) + '</b></span><span role="cell">' + esc(String(x.words.max)) + '</span></div>';
      }).join('') + '</div><p class="small muted">Numbers are words, except References. ' + esc(guide('order').words.note) + '</p></div>';
  }
  // the body of one guide; used on its own page and inside a programme step
  function guideBody(w) {
    if (w.terms) return '<div class="note simple"><span class="eyebrow">In simple words</span><p>' + esc(w.what) + '</p></div>' +
      '<dl class="gloss">' + w.terms.map(function (t) { return '<div><dt>' + esc(t[0]) + '</dt><dd>' + esc(t[1]) + '</dd></div>'; }).join('') + '</dl>';
    var first = w.intro;
    return '<div class="note simple"><span class="eyebrow">In simple words</span><p>' + esc(w.what) + '</p></div>' +
      (w.budget ? budgetTable() : wordsBox(w)) +
      '<div class="stack"><span class="eyebrow">The pattern, step by step</span><ol class="lesson">' + w.pattern.map(function (s, k) { return '<li><span class="n">' + (k + 1) + '</span><div><b>' + esc(s.h) + '</b><p>' + esc(s.p) + '</p></div></li>'; }).join('') + '</ol></div>' +
      (w.starters ? '<div class="stack"><span class="eyebrow">' + (first ? 'Tips' : 'Sentence starters') + '</span><ul class="starters">' + w.starters.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>' : '') +
      (w.example ? '<div class="stack"><span class="eyebrow">Example</span><div class="ex-box ex-weak"><span class="lbl">Weak</span><p>' + esc(w.example.weak) + '</p></div><div class="ex-box ex-strong"><span class="lbl">Strong</span><p>' + esc(w.example.strong) + '</p></div></div>' : '') +
      '<div class="stack"><div class="row spread wrap"><span class="eyebrow">' + (first ? 'The order' : 'Template to fill in') + '</span><button class="btn btn-quiet btn-sm" type="button" data-cp="' + w.id + '">Copy</button></div><div class="paper" data-tpl="' + w.id + '">' + esc(w.template) + '</div></div>' +
      '<div class="note mistakes"><span class="eyebrow">Common mistakes to avoid</span><ul>' + w.mistakes.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>';
  }
  function bindGuides(root) {
    root.querySelectorAll('[data-cp]').forEach(function (b) { if (b.dataset.bound) return; b.dataset.bound = 1; b.addEventListener('click', function () { var w = guide(b.dataset.cp); copy(w.template, root.querySelector('[data-tpl="' + w.id + '"]')); }); });
  }
  function wordsLabel(w) { return w.words ? (w.words.unit === 'references' ? w.words.ideal + ' references' : w.words.ideal + ' words') : w.length; }
  /* "How to write it" inside a step: the guides for that step, opened one at a time */
  function stepGuides(t, n) {
    var ids = (WSTEPS[t] || {})[n]; if (!ids || !ids.length) return '';
    return '<div class="stack wguides"><span class="eyebrow">How to write it</span><p class="small muted">' + (ids.length > 1 ? 'Tap a part to open its guide: the pattern, how many words, sentence starters, an example and a template.' : 'Tap to open the guide: the pattern, how many words, sentence starters, an example and a template.') + '</p>' +
      ids.map(function (id) { var w = guide(id); if (!w) return ''; return '<details class="wg"><summary><span class="li-main"><b>' + esc(w.title) + '</b><span class="small muted">' + esc(w.short) + '</span></span><span class="wchip">' + esc(wordsLabel(w)) + '</span>' + ic('chev', 'chev') + '</summary><div class="wg-body stack-lg">' + guideBody(w) + '</div></details>'; }).join('') + '</div>';
  }
  function vBasics() {
    var html = '<section class="page-head"><span class="eyebrow">Writing basics</span><h1>How to write each part</h1><p class="muted">Never written a research paper? Start here. Each part shows the pattern, how many words to write, sentence starters, an example and a template to fill in.</p></section>' +
      '<div class="glass list">' + W.map(function (w) {
        var no = partNo(w);
        return '<a class="li" href="#basics-' + w.id + '"><span class="sicon current">' + (no ? no : ic(w.terms ? 'book' : 'sparkle')) + '</span><div class="li-main"><span class="li-title">' + esc(w.title) + '</span><span class="li-sub">' + esc(w.short) + '</span></div><div class="li-end"><span class="wchip">' + esc(wordsLabel(w)) + '</span>' + ic('chev', 'chev') + '</div></a>';
      }).join('') + '</div>';
    return { html: html };
  }
  function vBasic(id) {
    var i = W.map(function (w) { return w.id; }).indexOf(id);
    if (i < 0) { setHash('basics'); return vBasics(); }
    var w = W[i], prev = W[i - 1], next = W[i + 1], no = partNo(w);
    var html = '<a class="back" href="#basics">' + ic('back', 'chev') + 'Writing basics</a>' +
      '<section class="page-head"><span class="eyebrow">' + (no ? 'Part ' + no + ' of ' + partsCount() : 'Start here') + ' · ' + esc(w.length) + '</span><h1>' + esc(w.title) + '</h1></section>' +
      '<article class="glass card stack-lg">' + guideBody(w) + '</article>' +
      '<div class="row spread wrap basics-nav">' + (prev ? '<a class="btn btn-glass" href="#basics-' + prev.id + '">' + ic('back') + esc(prev.title) + '</a>' : '<span></span>') + (next ? '<a class="btn btn-primary" href="#basics-' + next.id + '">Next: ' + esc(next.title) + ' →</a>' : '<a class="btn btn-primary" href="#today">Back to today’s step</a>') + '</div>';
    return { html: html, mount: bindGuides };
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
  /* ---------- admin: overview (a dashboard: stats, activity chart, queue, calendar) ---------- */
  var ovSeries = 'subs', ovMonth = null, memberIndex = null;
  function dayKey(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function lastDays(map, n) { var out = [], d = new Date(); for (var k = n - 1; k >= 0; k--) { var x = new Date(d); x.setDate(d.getDate() - k); out.push((map || {})[dayKey(x)] || 0); } return out; }
  function miniBars(vals, color) {
    var mx = Math.max.apply(null, vals.concat([1]));
    return '<svg class="mini" viewBox="0 0 ' + (vals.length * 9) + ' 32" aria-hidden="true">' + vals.map(function (v, i) { var h = 4 + 26 * v / mx; return '<rect x="' + (i * 9 + 2) + '" y="' + (32 - h) + '" width="4" height="' + h + '" rx="2" fill="' + color + '" opacity="' + (v ? 1 : .28) + '"/>'; }).join('') + '</svg>';
  }
  function miniLine(vals, color) {
    var mx = Math.max.apply(null, vals.concat([1])), w = 90, pts = vals.map(function (v, i) { return [i * w / (vals.length - 1), 28 - 22 * v / mx]; });
    return '<svg class="mini" viewBox="0 0 90 32" aria-hidden="true"><path d="' + smooth(pts) + '" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/></svg>';
  }
  function miniGauge(v, total, color) {
    var k = total ? Math.min(1, v / total) : 0, c = Math.PI * 26;
    return '<svg class="mini gauge" viewBox="0 0 64 36" aria-hidden="true"><path class="gt" d="M6 32a26 26 0 0 1 52 0" fill="none" stroke-width="7" stroke-linecap="round"/><path d="M6 32a26 26 0 0 1 52 0" fill="none" stroke="' + color + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (c * k).toFixed(1) + ' ' + c.toFixed(1) + '"/></svg>';
  }
  function smooth(p) { // Catmull-Rom through the points, as cubic curves
    if (p.length < 2) return '';
    var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (var i = 0; i < p.length - 1; i++) {
      var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      d += 'C' + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + ' ' + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + ' ' + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + ' ' + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + ' ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1);
    }
    return d;
  }
  function weekly(map) { // the last 12 weeks, oldest first: [{label, n}]
    var out = [], now = new Date();
    for (var w = 11; w >= 0; w--) {
      var end = new Date(now), n = 0; end.setDate(now.getDate() - w * 7);
      for (var k = 0; k < 7; k++) { var x = new Date(end); x.setDate(end.getDate() - k); n += (map || {})[dayKey(x)] || 0; }
      var st = new Date(end); st.setDate(end.getDate() - 6);
      out.push({ label: st.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), n: n });
    }
    return out;
  }
  function activityChart(stats) {
    var data = weekly(ovSeries === 'subs' ? stats.submissionsByDay : stats.reviewsByDay), W = 640, H = 210, L = 34, B = 26, T = 34;
    var mx = Math.max.apply(null, data.map(function (d) { return d.n; }).concat([4]));
    var step = Math.ceil(mx / 4), top = step * 4;
    var pts = data.map(function (d, i) { return [L + i * (W - L - 12) / (data.length - 1), T + (H - T - B) * (1 - d.n / top)]; });
    var peak = data.reduce(function (b, d, i) { return d.n > data[b].n ? i : b; }, 0), pk = pts[peak];
    var grid = [0, 1, 2, 3, 4].map(function (g) { var y = T + (H - T - B) * (1 - g / 4); return '<line x1="' + L + '" x2="' + (W - 8) + '" y1="' + y + '" y2="' + y + '" class="gl"/><text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (g * step) + '</text>'; }).join('');
    var xs = data.map(function (d, i) { return i % 2 ? '' : '<text x="' + pts[i][0] + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(d.label) + '</text>'; }).join('');
    var line = smooth(pts), area = line + 'L' + pts[pts.length - 1][0] + ' ' + (H - B) + 'L' + pts[0][0] + ' ' + (H - B) + 'Z';
    var tag = data[peak].n + (ovSeries === 'subs' ? ' submitted' : ' reviewed');
    return '<svg class="achart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (ovSeries === 'subs' ? 'Submissions' : 'Your reviews') + ' per week, last 12 weeks">' +
      '<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4B5CF0" stop-opacity=".28"/><stop offset="1" stop-color="#4B5CF0" stop-opacity="0"/></linearGradient></defs>' +
      grid + xs + '<path d="' + area + '" fill="url(#ag)"/><path d="' + line + '" class="ln"/>' +
      (data[peak].n ? '<line x1="' + pk[0] + '" x2="' + pk[0] + '" y1="' + pk[1] + '" y2="' + (H - B) + '" class="pkl"/><circle cx="' + pk[0] + '" cy="' + pk[1] + '" r="6" class="pkc"/>' +
        '<g transform="translate(' + Math.min(W - 60, Math.max(60, pk[0])) + ' ' + Math.max(14, pk[1] - 22) + ')"><rect x="-52" y="-14" width="104" height="24" rx="12" class="pkb"/><text y="3" text-anchor="middle" class="pkt">' + tag + '</text></g>' : '') +
      '</svg>';
  }
  function calendar(stats) {
    var base = ovMonth || new Date(), y = base.getFullYear(), mo = base.getMonth(), first = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate(), t = dayKey(new Date());
    var cells = '';
    for (var k = 0; k < first; k++) cells += '<span></span>';
    for (var dd = 1; dd <= days; dd++) {
      var key = y + '-' + ('0' + (mo + 1)).slice(-2) + '-' + ('0' + dd).slice(-2), rv = (stats.reviewsByDay || {})[key], sb = (stats.submissionsByDay || {})[key];
      var cls = key === t ? 'today' : rv ? 'rv' : sb ? 'sb' : '';
      cells += '<span class="' + cls + '" title="' + (rv ? rv + ' reviewed by you' : '') + (rv && sb ? ' · ' : '') + (sb ? sb + ' submitted' : '') + '">' + dd + '</span>';
    }
    return '<div class="cal-head"><b>' + base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) + '</b><span><button type="button" data-cal="-1" aria-label="Previous month">' + ic('back') + '</button><button type="button" data-cal="1" aria-label="Next month">' + ic('chev') + '</button></span></div>' +
      '<div class="cal-grid">' + ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(function (x) { return '<i>' + x + '</i>'; }).join('') + cells + '</div>' +
      '<div class="cal-key"><span class="k rv"></span>You reviewed<span class="k sb"></span>Work submitted<span class="k today"></span>Today</div>';
  }
  async function vOverview(stats) {
    var both = await Promise.all([S.queue(), can('applications') ? S.applications() : Promise.resolve([])]), q = both[0], apps = both[1].filter(function (a) { return a.status === 'new'; });
    var old = q[0], hour = new Date().getHours(), wave = hour < 12 ? '☀️' : hour < 18 ? '👋' : '🌙';
    var tiles = [
      ['#reviews', 'Waiting for review', stats.pending, 'clock', 'c-amber', miniBars(lastDays(stats.submissionsByDay, 10), '#E5883A'), stats.pendingMine ? stats.pendingMine + ' from your students' : 'submissions'],
      ['#members', 'Your students', stats.myMembers, 'users', 'c-pen', miniGauge(stats.myMembers, stats.members, '#4B5CF0'), 'of ' + stats.members + ' active'],
      can('applications') ? ['#applications', 'New applications', stats.applications, 'mail', 'c-rose', miniLine(lastDays(stats.submissionsByDay, 14).map(function (v, i) { return v + (i % 3); }), '#DD4460'), 'to look at'] :
        ['#messages', 'Unread messages', stats.unreadChats || 0, 'msgs', 'c-rose', miniLine(lastDays(stats.submissionsByDay, 14), '#DD4460'), 'in the chat'],
      ['#reviews', 'Approved this week', stats.approvedWeek, 'done', 'c-teal', miniBars(lastDays(stats.reviewsByDay, 7), '#0B9E8C'), 'steps approved']
    ];
    var tools = [];
    if (canViewLessons()) tools.push(['#lessons', can('edit_lessons') ? 'Edit lessons' : 'Lessons', 'Proofread any step as students see it.', 'pen']);
    if (isOwner()) tools.push(['#team', 'Team & permissions', 'Mentors, permissions and all activity.', 'users'], ['#research', 'Student publications', 'Your students’ papers on the website.', 'paper']);
    if (!tools.length) tools.push(['#members', 'Your students', 'Programmes, progress and chats.', 'users'], ['#messages', 'Messages', 'Reply to your students.', 'msgs']);
    var html = '<div class="ov">' +
      '<div class="ov-main stack-lg">' +
        '<div class="ov-top"><div><h1>' + greet() + ', ' + esc(first(me.name)) + ' ' + wave + '</h1><p class="muted">' + (stats.pending ? stats.pending + ' submission' + (stats.pending > 1 ? 's are' : ' is') + ' waiting for review.' : 'You’re all caught up. Nice work!') + '</p></div>' +
          '<div class="ov-tools"><div class="ov-search"><span aria-hidden="true">' + ic('search') + '</span><input id="ov-q" type="search" placeholder="Search students…" autocomplete="off" aria-label="Search students"><div class="ov-results glass list" id="ov-res" hidden></div></div>' +
          '<a class="ov-bell" href="#messages" aria-label="Messages">' + ic('bell') + ((stats.unreadChats || 0) ? '<i class="dot"></i>' : '') + '</a></div></div>' +
        '<div class="tiles">' + tiles.map(function (x) {
          return '<a class="tile glass ' + x[4] + '" href="' + x[0] + '"><div class="tile-h"><span>' + esc(x[1]) + '</span><i>' + ic(x[3]) + '</i></div>' + x[5] + '<div class="tile-n"><b data-count="' + x[2] + '">' + x[2] + '</b><small>' + esc(x[6]) + '</small></div></a>';
        }).join('') + '</div>' +
        '<div class="ov-row">' +
          '<section class="glass card ov-chart"><div class="row spread"><h3>Activity</h3><div class="seg sm" id="ov-seg" style="--n:2;--i:' + (ovSeries === 'subs' ? 0 : 1) + '"><button type="button" data-s="subs"' + (ovSeries === 'subs' ? ' class="on"' : '') + '>Submissions</button><button type="button" data-s="reviews"' + (ovSeries === 'reviews' ? ' class="on"' : '') + '>Your reviews</button></div></div><div id="ov-ch">' + activityChart(stats) + '</div><p class="small muted">Per week, last 12 weeks</p></section>' +
          (old ? '<a class="glass card ov-next" href="#review-' + esc(old.id) + '"><div class="nx-text"><span class="eyebrow">Next to review</span><h3>' + esc(old.member.name) + '</h3><p class="small muted">' + esc(T(old.track).short) + ' · Step ' + old.step + ' · ' + esc(stepOf(old.track, old.step).title) + '</p>' +
            '<div class="nx-n"><b>' + q.length + '</b><span>waiting</span></div><div class="nx-n"><b>' + rel(old.createdAt).replace(' ago', '') + '</b><span>oldest</span></div><span class="btn btn-primary btn-sm">Review now →</span></div><div class="nx-art" aria-hidden="true">' + ic('paper') + '<i></i><i></i><i></i></div></a>'
          : '<div class="glass card ov-next done"><div class="nx-text"><span class="eyebrow">Review queue</span><h3>All caught up 🎉</h3><p class="small muted">New submissions will appear here.</p></div><div class="nx-art" aria-hidden="true">' + ic('done') + '<i></i><i></i><i></i></div></div>') +
        '</div>' +
        '<section class="stack"><div class="phase-title"><h3>Shortcuts</h3></div><div class="ov-shortcuts">' + tools.map(function (t, i) {
          return '<a class="glass card sc' + (i === 1 || tools.length === 1 ? ' hi' : '') + '" href="' + t[0] + '"><div><h3>' + esc(t[1]) + '</h3><p class="small">' + esc(t[2]) + '</p><span class="sc-go">Open</span></div><span class="sc-ic">' + ic(t[3]) + '</span></a>';
        }).join('') + '</div></section>' +
      '</div>' +
      '<aside class="ov-side stack">' +
        '<div class="ov-me"><span class="avatar">' + initials(me.name) + '</span><div class="li-main"><b>' + esc(me.name) + '</b><span class="small muted">' + (me.owner ? 'Owner' : esc(me.title || 'Mentor')) + '</span></div><button class="ov-more" type="button" id="ov-acct" aria-label="Account and settings">•••</button></div>' +
        '<div class="ov-nums glass"><div><b>' + stats.myMembers + '</b><span>Students</span></div><div><b>' + (stats.reviewedTotal || 0) + '</b><span>Reviewed</span></div><div><b>' + stats.approvedWeek + '</b><span>This week</span></div></div>' +
        '<div class="glass card cal" id="ov-cal">' + calendar(stats) + '</div>' +
        '<div class="phase-title"><h3>Waiting for review</h3><a class="small" href="#reviews">View all</a></div>' +
        (q.length ? '<div class="ov-wait">' + q.slice(0, 3).map(function (s) {
          return '<a class="glass wait" href="#review-' + esc(s.id) + '"><span class="avatar warm">' + initials(s.member.name) + '</span><div class="li-main"><span class="tagp">' + esc(T(s.track).short) + '</span><b>' + esc(s.member.name) + '</b><span class="small muted">Step ' + s.step + ' · ' + esc(stepOf(s.track, s.step).title) + '</span></div><span class="small muted">' + rel(s.createdAt) + '</span></a>';
        }).join('') + '</div>' : '<div class="glass empty"><span>Nothing waiting right now.</span></div>') +
        (can('applications') && apps.length ? '<div class="phase-title"><h3>New applications</h3><a class="small" href="#applications">View all</a></div><div class="ov-wait">' + apps.slice(0, 2).map(function (a) {
          return '<a class="glass wait" href="#applications"><span class="avatar">' + initials(a.name) + '</span><div class="li-main"><span class="tagp">Applied</span><b>' + esc(a.name) + '</b><span class="small muted">' + esc(a.level || '') + '</span></div><span class="small muted">' + rel(a.createdAt) + '</span></a>';
        }).join('') + '</div>' : '') +
      '</aside></div>';
    return { html: html, mount: function (m) {
      m.querySelector('#ov-acct').addEventListener('click', accountSheet);
      m.querySelectorAll('#ov-seg [data-s]').forEach(function (b) { b.addEventListener('click', function () {
        ovSeries = b.dataset.s; var seg = m.querySelector('#ov-seg'); seg.style.setProperty('--i', ovSeries === 'subs' ? 0 : 1);
        seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
        m.querySelector('#ov-ch').innerHTML = activityChart(stats);
      }); });
      var cal = m.querySelector('#ov-cal');
      cal.addEventListener('click', function (e) { var b = e.target.closest('[data-cal]'); if (!b) return; var d = ovMonth || new Date(); ovMonth = new Date(d.getFullYear(), d.getMonth() + (+b.dataset.cal), 1); cal.innerHTML = calendar(stats); });
      /* search: students by name, email or college */
      var qi = m.querySelector('#ov-q'), res = m.querySelector('#ov-res');
      var load = function () { if (!memberIndex) memberIndex = S.members().catch(function () { return []; }); return memberIndex; };
      qi.addEventListener('focus', load);
      qi.addEventListener('input', function () {
        var t = qi.value.trim().toLowerCase();
        if (!t) { res.hidden = true; return; }
        load().then(function (list) {
          var hit = list.filter(function (u) { return [u.name, u.email, u.college].join(' ').toLowerCase().indexOf(t) > -1; }).slice(0, 6);
          res.innerHTML = hit.length ? hit.map(function (u) { return '<a class="li" href="#member-' + esc(u.id) + '"><span class="avatar warm">' + initials(u.name) + '</span><div class="li-main"><span class="li-title">' + esc(u.name) + '</span><span class="li-sub">' + esc(u.college || u.email) + '</span></div></a>'; }).join('') : '<div class="li"><span class="small muted">No students match “' + esc(qi.value.trim()) + '”.</span></div>';
          res.hidden = false;
        });
      });
      qi.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var a = res.querySelector('a'); if (a) location.hash = a.getAttribute('href'); } if (e.key === 'Escape') { qi.value = ''; res.hidden = true; } });
      document.addEventListener('click', function off(e) { if (!m.isConnected) { document.removeEventListener('click', off); return; } if (!e.target.closest('.ov-search')) res.hidden = true; });
    } };
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
  var chatTimer = 0, chatContext = null, chatDraft = '';
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
      if (o.draft) { inp.value = o.draft; grow(); inp.dispatchEvent(new Event('input')); }
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
    var r = await S.chat(), context = chatContext, draft = chatDraft; chatContext = null; chatDraft = '';
    var suggest = ['I’m stuck on today’s step.', 'Can you check my research topic?', 'Which journal should I choose?'];
    return chatScreen({
      messages: r.messages, context: context, draft: draft, placeholder: 'Message your mentor…',
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

  /* ---------- owners: published research (the website's Published research page) ---------- */
  var RESEARCH_KINDS = ['Original article', 'Systematic review', 'Meta-analysis', 'Case report', 'Letter to the editor', 'Narrative review', 'Thesis', 'Conference abstract', 'Other'];
  async function vResearch() {
    var list = (await S.research()).research;
    var rows = list.map(function (p) {
      var sub = [p.journal, p.year, p.kind].filter(Boolean).map(esc).join(' · ');
      return '<div class="li app"><div class="li-main"><span class="li-title">' + esc(p.title) + '</span><span class="li-sub"><b>' + esc(p.student) + '</b> · ' + sub + '</span>' +
        (p.link ? '<a class="small rs-link" href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.link.replace(/^https?:\/\//, '')) + '</a>' : '') + '</div>' +
        '<div class="row rs-actions"><button class="btn btn-glass btn-sm" type="button" data-edit="' + esc(p.id) + '">Edit</button><button class="btn btn-danger btn-sm" type="button" data-del="' + esc(p.id) + '">Remove</button></div></div>';
    }).join('');
    return { html: '<a class="back" href="#overview">' + ic('back', 'chev') + 'Overview</a>' +
      '<section class="page-head"><div class="row spread wrap"><div class="stack" style="gap:6px"><span class="eyebrow">Owners only</span><h1>Student publications</h1></div><button class="btn btn-primary" type="button" id="add-paper">+ Add paper</button></div>' +
      '<p class="muted">Papers your students published with you. They show on the website’s <a href="research.html" target="_blank" rel="noopener">Student publications</a> page straight away, newest year first. Add a paper only with the student’s permission.</p></section>' +
      (list.length ? '<div class="glass list">' + rows + '</div>' : '<div class="glass empty"><b>No papers yet</b><span>Tap Add paper to put your first student’s publication on the website.</span></div>'),
      mount: function (m) {
        m.querySelector('#add-paper').addEventListener('click', function () { researchSheet(null); });
        m.querySelectorAll('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { researchSheet(list.filter(function (p) { return p.id === b.dataset.edit; })[0]); }); });
        m.querySelectorAll('[data-del]').forEach(function (b) {
          b.addEventListener('click', function () {
            var p = list.filter(function (x) { return x.id === b.dataset.del; })[0];
            sheet('<h2>Remove this paper?</h2><p class="muted">“' + esc(p.title) + '” by ' + esc(p.student) + ' comes off the website. You can add it again later.</p><div class="row"><button class="btn btn-glass" type="button" data-close style="flex:1">Cancel</button><button class="btn btn-danger" type="button" id="yes" style="flex:1">Remove</button></div>',
              function (el, close) { el.querySelector('#yes').addEventListener('click', function () { S.removeResearch(p.id).then(function () { close(); toast('Paper removed'); render(); }, function (e) { toast(e.message); }); }); });
          });
        });
      } };
  }
  function researchSheet(p) {
    var e = p || {};
    sheet('<h2>' + (p ? 'Edit paper' : 'Add a published paper') + '</h2><p class="muted small">This shows publicly on the website’s Student publications page.</p>' +
      '<form id="rs" class="stack" novalidate>' +
        '<div class="field"><label for="rs-student">Student’s name</label><input id="rs-student" autocomplete="off" required placeholder="Eeman Dar" value="' + esc(e.student || '') + '"></div>' +
        '<div class="field"><label for="rs-title">Research title</label><textarea id="rs-title" rows="2" required placeholder="Knowledge of hand hygiene among final-year medical students in Lahore">' + esc(e.title || '') + '</textarea></div>' +
        '<div class="field"><label for="rs-journal">Journal</label><input id="rs-journal" autocomplete="off" required placeholder="Pakistan Journal of Medical Sciences" value="' + esc(e.journal || '') + '"></div>' +
        '<div class="rs-two"><div class="field"><label for="rs-year">Year <span class="muted">(optional)</span></label><input id="rs-year" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="' + new Date().getFullYear() + '" value="' + esc(e.year || '') + '"></div>' +
        '<div class="field"><label for="rs-kind">Type <span class="muted">(optional)</span></label><select id="rs-kind"><option value="">Choose</option>' + RESEARCH_KINDS.map(function (k) { return '<option' + (k === e.kind ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="field"><label for="rs-link">DOI or link <span class="muted">(optional)</span></label><input id="rs-link" autocomplete="off" inputmode="url" placeholder="10.12669/pjms.40.1.1234" value="' + esc(e.link || '') + '"></div>' +
        '<p class="error" id="rs-err" role="alert" hidden></p>' +
        '<button class="btn btn-primary btn-block" type="submit">' + (p ? 'Save changes' : 'Add to website') + '</button><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Cancel</button>' +
      '</form>',
      function (el, close) {
        var f = el.querySelector('#rs'), err = el.querySelector('#rs-err'), v = function (id) { return el.querySelector('#' + id).value.trim(); };
        f.addEventListener('submit', function (ev) {
          ev.preventDefault();
          var show = function (msg) { err.textContent = msg; err.hidden = false; };
          if (!v('rs-student')) return show('Enter the student’s name.');
          if (!v('rs-title')) return show('Enter the research title.');
          if (!v('rs-journal')) return show('Enter the journal.');
          if (v('rs-year') && !/^\d{4}$/.test(v('rs-year'))) return show('Enter the year as four digits, like 2026.');
          var data = { student: v('rs-student'), title: v('rs-title'), journal: v('rs-journal'), year: v('rs-year'), kind: v('rs-kind'), link: v('rs-link') };
          (p ? S.updateResearch(p.id, data) : S.addResearch(data)).then(function () { close(); toast(p ? 'Paper updated' : 'Added to the website'); render(); }, function (x) { show(x.message); });
        });
      });
  }

  /* ---------- owners: lessons (proofread and edit) ---------- */
  var lessonTrack = null;
  async function vLessons() {
    await loadLessons(true);
    if (!lessonTrack) lessonTrack = C.tracks[0].id;
    var tr = T(lessonTrack), edited = function (t, n) { return !!lessonEdits[t + ':' + n]; };
    var count = Object.keys(lessonEdits).length;
    return { html: '<a class="back" href="#overview">' + ic('back', 'chev') + 'Overview</a>' +
      '<section class="page-head"><span class="eyebrow">' + (can('edit_lessons') ? 'Proofread and edit' : 'Read only') + '</span><h1>Lessons</h1><p class="muted">' + (can('edit_lessons') ? 'Open any step to read it exactly as students see it, then edit the wording. Changes show up for students straight away. ' : 'Open any step to read it exactly as students see it. ') +
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
        (can('edit_lessons') ? '<div class="row">' + (ed ? '<button class="btn btn-quiet btn-sm" type="button" id="l-reset">Reset to original</button>' : '') + '<button class="btn btn-primary btn-sm" type="button" id="l-edit">' + ic('pen') + 'Edit this step</button></div>' : '') + '</div>' +
      '<p class="small muted">Preview: this is exactly what students see.</p>' + card.html + nav;
    return { html: html, mount: function (m) {
      card.mount(m);
      var le = m.querySelector('#l-edit'); if (le) le.addEventListener('click', function () { lessonEditor(m, t, n, d); });
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
    ['passwords', 'Reset student passwords', 'Reset or set passwords for their students.'],
    ['view_lessons', 'View lessons', 'Read every step of every programme as students see it.'],
    ['edit_lessons', 'Edit lessons', 'Proofread and change the wording of any step (includes viewing).']
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
  /* the message sent with login details: a warm welcome for new mentors, a welcome for new
     students, and a plain note for password resets */
  function welcomeMessage(u, pw, reset) {
    var link = location.href.split('#')[0], mentor = u.role === 'admin';
    var login = 'Email: ' + u.email + '\nPassword: ' + pw + '\n\nLog in here: ' + link;
    var change = 'Please change this temporary password after you log in: tap your initials at the top right, then Change password.';
    if (reset) return 'Hi ' + short(u.name) + ', your Researchette password has been reset.\n\n' + (mentor ? 'Your mentor portal login:\n' : 'Your portal login:\n') + login + '\n\n' + change;
    if (mentor) return 'Welcome to the Researchette team, ' + short(u.name) + '!\n\n' +
      'Thank you so much for joining us as a mentor. Your experience and guidance will make a real difference to our students, and we’re truly grateful to have you with us.\n\n' +
      'Your mentor portal login:\n' + login + '\n\n' + change + '\n\nA short tour will show you around when you first log in. If you need anything at all, just message us. Welcome aboard!';
    return 'Welcome to Researchette, ' + short(u.name) + '! 🎉\n\n' +
      'We’re so happy you’re here. This is the start of your research journey, and we’ll be with you every step of the way, from your very first idea to a published paper. 📄✨\n\n' +
      'Your portal login 🔐\n' + login + '\n\n' +
      'First things first: please change this temporary password after you log in (tap your initials at the top right, then Change password).\n\n' +
      'Your first small task is already waiting for you. Take it one step a day and don’t worry about getting it perfect. That’s what your mentor is here for. 💙\n\n' +
      'See you inside!\nTeam Researchette';
  }
  function credentialsSheet(u, pw, title, note) {
    var msg = welcomeMessage(u, pw, /password/i.test(title)), num = waNumber(u.phone);
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
          '<div class="stack" style="margin-top:14px">' + dots(st) + roadmapList(t, st, function (x) { return x.submission ? '#review-' + x.submission.id : ''; }, can('edit_members') ? function (x) {
            if (x.status === 'locked') return '<button class="btn btn-glass btn-sm unlock-btn" type="button" data-unlock="' + t + ':' + x.step + '">' + ic('lock') + 'Unlock</button>';
            if (x.unlocked && x.status === 'current') return '<span class="pill review">Unlocked</span><button class="btn btn-quiet btn-sm" type="button" data-relock="' + t + ':' + x.step + '">Lock again</button>';
            return null;
          } : null) + (can('edit_members') ? '<p class="small muted">Unlock any step to let ' + esc(fn) + ' start it now, without finishing the steps before it.</p>' : '') + '</div></details>';
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
        m.querySelectorAll('[data-unlock], [data-relock]').forEach(function (b) {
          b.addEventListener('click', function () {
            var k = (b.dataset.unlock || b.dataset.relock).split(':'), open = !!b.dataset.unlock, label = T(k[0]).name + ', Step ' + k[1] + ' (' + stepOf(k[0], +k[1]).title + ')';
            b.disabled = true;
            S.unlockStep(id, k[0], +k[1], open).then(function () {
              if (open) note(label + ' is now open for you to start');
              toast(open ? 'Step ' + k[1] + ' unlocked' : 'Step ' + k[1] + ' locked again'); render();
            }, function (e) { b.disabled = false; toast(e.message); });
          });
        });
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
