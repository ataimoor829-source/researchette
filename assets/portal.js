/* Researchette portal: login, member portal and admin (mentor) portal in one page.
   Routes live in the URL hash: #login, #today, #roadmap, #step-3, #feedback,
   #overview, #reviews, #review-<id>, #members, #member-<id>, #applications. */
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
    done: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'
  };
  function ic(n, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>'; }
  var LOGO = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="7" fill="#3448D8"/><path d="M5 13h3l2-5 3 9 2-4h4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var LABEL = { approved: 'Approved', review: 'In review', revision: 'Needs changes', current: 'To do', locked: 'Locked', new: 'New', declined: 'Declined' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(n) { return esc(String(n || '?').split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase()); }
  function first(n) { return esc(String(n || '').split(' ')[0]); }
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
  function step(n) { return C.steps[n - 1]; }
  function phaseOf(n) { return C.phases[step(n).phase - 1]; }
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
    function close() { bg.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    document.addEventListener('keydown', key);
    bg.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    if (mount) mount(bg.querySelector('.sheet'), close);
    var f = bg.querySelector('button, input, textarea'); if (f) f.focus({ preventScroll: true });
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
  var MENTOR_WA = '923395888444';
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
    member: [{ id: 'today', label: 'Today', icon: 'today' }, { id: 'roadmap', label: 'Roadmap', icon: 'map' }, { id: 'feedback', label: 'Feedback', icon: 'chat' }],
    admin: [{ id: 'overview', label: 'Overview', icon: 'home' }, { id: 'reviews', label: 'Reviews', icon: 'inbox', badge: 'pending' }, { id: 'members', label: 'Members', icon: 'users' }, { id: 'applications', label: 'Applications', icon: 'mail', badge: 'applications' }]
  };
  function tabsHtml(cls) {
    return '<nav class="tabs ' + cls + '" aria-label="Sections">' + TABS[me.role].map(function (t) {
      return '<a href="#' + t.id + '" data-tab="' + t.id + '">' + ic(t.icon) + '<span>' + t.label + '</span>' + (t.badge ? '<span class="badge" data-badge="' + t.badge + '" hidden></span>' : '') + '</a>';
    }).join('') + '<span class="ind" aria-hidden="true"></span></nav>';
  }
  function ensureShell() {
    var key = me.id + ':' + me.role;
    if (app.dataset.shell === key) return;
    app.dataset.shell = key;
    var home = me.role === 'admin' ? 'overview' : 'today';
    app.innerHTML =
      '<header class="topbar"><div class="shell"><div class="topbar-inner">' +
        '<a class="logo" href="#' + home + '">' + LOGO + '<span>research<i>ette</i></span>' + (me.role === 'admin' ? '<span class="role">Mentor</span>' : '') + '</a>' +
        tabsHtml('top') +
        '<div class="top-actions"><button class="avatar-btn" id="acct" type="button" aria-label="Account and settings"><span class="avatar ' + (me.role === 'admin' ? '' : 'warm') + '">' + initials(me.name) + '</span></button></div>' +
      '</div></div></header>' +
      '<main class="view shell" id="view"></main>' + tabsHtml('bottom');
    document.getElementById('acct').addEventListener('click', accountSheet);
  }
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
      (me.role === 'member' ? waButton(MENTOR_WA, 'Hi, I’m ' + me.name + ', a Researchette member. I have a question.', 'Contact your mentor on WhatsApp', 'btn-block') : '') +
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
        el.querySelector('#logout').addEventListener('click', function () { S.signOut().then(function () { close(); app.dataset.shell = ''; go('login'); }); });
        var rs = el.querySelector('#reset');
        if (rs) rs.addEventListener('click', function () {
          if (rs.dataset.armed) { S.reset().then(function () { close(); app.dataset.shell = ''; toast('Demo data reset'); go('login'); }); return; }
          rs.dataset.armed = '1'; rs.textContent = 'Tap again to reset all demo data';
        });
      });
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
    me = await S.me();
    var r = (location.hash || '').slice(1);
    if (!me) { app.dataset.shell = ''; if (r !== 'login') setHash('login'); return loginView(); }
    if (r === 'login' || !r) { r = me.role === 'admin' ? 'overview' : 'today'; setHash(r); }

    var view, tab, badges = null;
    if (me.role === 'admin') {
      badges = await S.stats();
      if (/^review-/.test(r)) { view = vReview(r.slice(7)); tab = 'reviews'; }
      else if (/^member-/.test(r)) { view = vMember(r.slice(7)); tab = 'members'; }
      else if (r === 'reviews') { view = vReviews(); tab = r; }
      else if (r === 'members') { view = vMembers(); tab = r; }
      else if (r === 'applications') { view = vApplications(); tab = r; }
      else { view = vOverview(badges); tab = 'overview'; if (r !== 'overview') setHash('overview'); }
    } else {
      if (/^step-\d+$/.test(r)) { view = vStep(+r.slice(5)); tab = 'roadmap'; }
      else if (r === 'roadmap') { view = vRoadmap(); tab = r; }
      else if (r === 'feedback') { view = vFeedback(); tab = r; }
      else { view = vToday(); tab = 'today'; if (r !== 'today') setHash('today'); }
    }
    var v = await view;
    if (token !== busy) return;
    ensureShell();
    currentTab = tab; setTabs(tab, badges);
    var main = document.getElementById('view');
    main.innerHTML = v.html;
    main.classList.remove('view-enter'); void main.offsetWidth; main.classList.add('view-enter');
    scrollTo({ top: 0, behavior: 'instant' });
    if (v.mount) v.mount(main);
    placeInstall();
  }
  addEventListener('hashchange', render);

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
        '<p class="small muted">Forgot your password? Message your mentor and they’ll reset it.</p>' +
        '<p class="small">Not a member yet? <a href="index.html#join">Apply for membership</a></p>' +
      '</form></div>';
    var f = document.getElementById('login'), err = document.getElementById('l-err'), pw = document.getElementById('l-pw');
    document.getElementById('l-show').addEventListener('click', function () { var s = pw.type === 'password'; pw.type = s ? 'text' : 'password'; this.textContent = s ? 'Hide' : 'Show'; });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = f.querySelector('#l-email').value, btn = f.querySelector('[type=submit]');
      if (!email.trim() || !pw.value) { err.textContent = 'Enter your email and password.'; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'Logging in…';
      S.signIn(email, pw.value).then(function (u) { go(u.role === 'admin' ? 'overview' : 'today'); }, function (x) {
        err.textContent = x.message; err.hidden = false; btn.disabled = false; btn.textContent = 'Log in';
      });
    });
  }

  /* ---------- member: today ---------- */
  function ring(done) {
    var c = 2 * Math.PI * 32, off = c * (1 - done / 10);
    return '<div class="ring"><svg viewBox="0 0 76 76" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B9E8C"/><stop offset="1" stop-color="#3448D8"/></linearGradient></defs>' +
      '<circle class="track" cx="38" cy="38" r="32"/><circle class="fill" cx="38" cy="38" r="32" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (reduce ? off : c).toFixed(1) + '" data-off="' + off.toFixed(1) + '"/></svg><b>' + done + '/10</b></div>';
  }
  function animateRing(root) { var f = root.querySelector('.ring .fill'); if (f) requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.strokeDashoffset = f.dataset.off; }); }); }

  async function vToday() {
    var st = await S.stepStates(me.id);
    var done = st.filter(function (x) { return x.status === 'approved'; }).length;
    var cur = st.filter(function (x) { return x.status !== 'approved'; })[0];
    var head = '<section class="page-head"><span class="eyebrow">' + today() + '</span><h1>' + greet() + ', ' + first(me.name) + '.</h1></section>';
    if (!cur) {
      return { html: head + '<div class="glass card locked-box">' + ring(10) + '<span class="stamp">Roadmap complete!</span><h2>You’ve finished all 10 steps.</h2><p class="muted">Your mentor will help you with the final submission. Congratulations.</p></div>', mount: animateRing };
    }
    var d = step(cur.step);
    var summary = '<div class="glass card today-head">' + ring(done) + '<div class="txt"><span class="small muted">Your roadmap</span><h3>' + done + ' of 10 steps approved</h3><span class="small muted">Today: Step ' + cur.step + ' · ' + esc(d.title) + '</span></div></div>';
    var body = stepCard(cur.step, st);
    var help = '<div class="glass card help-card"><div><h3>Stuck on this step?</h3><p class="small muted">Message your mentor and get help on WhatsApp.</p></div>' +
      waButton(MENTOR_WA, 'Hi, I’m ' + me.name + ', a Researchette member. I need help with Step ' + cur.step + ': ' + d.title + '.', 'Contact on WhatsApp') + '</div>';
    return { html: head + summary + body.html + help, mount: function (m) { animateRing(m); body.mount(m); } };
  }

  async function vStep(n) {
    if (!(n >= 1 && n <= 10)) { setHash('roadmap'); return vRoadmap(); }
    var st = await S.stepStates(me.id), body = stepCard(n, st);
    return { html: '<a class="back" href="#roadmap">' + ic('back', 'chev') + 'Roadmap</a>' + body.html, mount: body.mount };
  }

  function stepCard(n, st) {
    var x = st[n - 1], d = step(n), ph = phaseOf(n), sub = x.submission;
    if (x.status === 'locked') {
      var open = st.filter(function (s) { return s.status !== 'approved'; })[0];
      return { html: '<div class="glass card locked-box">' + ic('lock') + '<h2>Step ' + n + ' · ' + esc(d.title) + '</h2><p class="muted">This step unlocks when step ' + (n - 1) + ' is approved.</p><a class="btn btn-glass" href="#step-' + open.step + '">Go to step ' + open.step + '</a></div>', mount: function () {} };
    }
    var tab = x.status === 'current' ? 0 : 2;
    var html = '<article class="glass card stack-lg" id="stepcard">' +
      '<div class="step-head"><div class="row spread wrap"><span class="eyebrow">Phase 0' + ph.id + ' · ' + esc(ph.name) + '</span>' + pill(x.status) + '</div>' +
      '<h2>Step ' + n + ' · ' + esc(d.title) + '</h2><div class="step-meta">' + ic('clock', 'chev') + d.minutes + ' min · ' + esc(d.summary) + '</div></div>' +
      '<div class="seg" role="tablist" style="--n:3;--i:' + tab + '"><button type="button" role="tab" data-t="0">Learn</button><button type="button" role="tab" data-t="1">Example</button><button type="button" role="tab" data-t="2">Task</button></div>' +
      '<div id="panel"></div></article>';

    function panel(t) {
      if (t === 0) return '<div class="panel stack"><ol class="lesson">' + d.lesson.map(function (l, i) {
        return '<li><span class="n">' + (i + 1) + '</span><div><b>' + esc(l.h) + '</b><p>' + esc(l.p) + '</p></div></li>';
      }).join('') + '</ol><button class="btn btn-glass" type="button" data-goto="1">See an example →</button></div>';
      if (t === 1) return '<div class="panel ex">' +
        '<div class="ex-box ex-weak"><span class="lbl">Weak</span><p>' + esc(d.example.weak) + '</p></div>' +
        '<div class="ex-box ex-strong"><span class="lbl">Strong</span><p>' + esc(d.example.strong) + '</p></div>' +
        '<p class="why"><b>Why it works:</b> ' + esc(d.example.why) + '</p>' +
        (x.status === 'current' || x.status === 'revision' ? '<button class="btn btn-primary" type="button" data-goto="2">Start the task →</button>' : '') + '</div>';
      var by = function (s) { return s && s.reviewer ? '<div class="by"><span class="avatar">' + initials(s.reviewer.name) + '</span>' + esc(s.reviewer.name) + ' · ' + rel(s.reviewedAt) + '</div>' : ''; };
      var out = '<div class="panel stack"><span class="eyebrow">Your task</span><p class="prompt">' + esc(d.task.prompt) + '</p>';
      if (x.status === 'revision') out += '<div class="note red"><span class="small"><b>Your mentor asked for changes</b></span><p class="fb">' + esc(sub.feedback) + '</p>' + by(sub) + '</div>';
      if (x.status === 'current' || x.status === 'revision') {
        out += '<div class="field"><label for="answer">Your answer</label><textarea id="answer" placeholder="Write your answer here. Your draft saves automatically."></textarea></div>' +
          '<div class="row spread wrap"><span class="counter" id="counter"></span><button class="btn btn-primary" type="button" id="send" disabled>' + (x.status === 'revision' ? 'Resubmit' : 'Submit for review') + '</button></div>';
      }
      if (x.status === 'review') out += '<div class="note amber"><b class="small">Submitted ' + rel(sub.createdAt) + '</b><span class="small muted">Your mentor will review it within 48 hours. You’ll see their feedback here.</span></div><div class="paper">' + esc(sub.text) + '</div>';
      if (x.status === 'approved') out += '<div><span class="stamp">Approved</span></div>' + (sub.feedback ? '<div class="note teal"><p class="fb">' + esc(sub.feedback) + '</p>' + by(sub) + '</div>' : '') +
        '<details><summary class="small muted" style="cursor:pointer">Your approved answer</summary><div class="paper" style="margin-top:10px">' + esc(sub.text) + '</div></details>' +
        (n < 10 ? '<a class="btn btn-primary" href="#step-' + (n + 1) + '">Go to step ' + (n + 1) + ' →</a>' : '');
      return out + '</div>';
    }

    function mount(root) {
      var card = root.querySelector('#stepcard'), seg = card.querySelector('.seg'), box = card.querySelector('#panel');
      function show(t) {
        seg.style.setProperty('--i', t);
        seg.querySelectorAll('button').forEach(function (b) { var on = +b.dataset.t === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        box.innerHTML = panel(t);
        box.querySelectorAll('[data-goto]').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.goto); }); });
        var ta = box.querySelector('#answer');
        if (ta) {
          var key = 'rt-draft-' + me.id + '-' + n, cnt = box.querySelector('#counter'), send = box.querySelector('#send');
          ta.value = store(key) || (x.status === 'revision' ? sub.text : '');
          var upd = function () {
            var w = words(ta.value), ok = w >= d.task.minWords;
            cnt.textContent = w + ' words · minimum ' + d.task.minWords; cnt.classList.toggle('ok', ok); send.disabled = !ok;
          };
          ta.addEventListener('input', function () { store(key, ta.value); upd(); }); upd();
          send.addEventListener('click', function () {
            send.disabled = true; send.textContent = 'Sending…';
            S.submit(me.id, n, ta.value.trim()).then(function () { store(key, null); toast('Sent to your mentor'); render(); }, function (e) { toast(e.message); send.disabled = false; });
          });
        }
      }
      seg.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { show(+b.dataset.t); }); });
      show(tab);
    }
    return { html: html, mount: mount };
  }

  /* ---------- member: roadmap ---------- */
  async function vRoadmap() {
    var st = await S.stepStates(me.id), done = st.filter(function (x) { return x.status === 'approved'; }).length;
    var html = '<section class="page-head"><span class="eyebrow">Original article</span><h1>Your roadmap</h1><div class="row"><div class="bar" style="flex:1"><i style="width:' + done * 10 + '%"></i></div><span class="small muted">' + done + ' of 10</span></div></section>';
    C.phases.forEach(function (ph) {
      var items = st.filter(function (x) { return step(x.step).phase === ph.id; });
      var pd = items.filter(function (x) { return x.status === 'approved'; }).length;
      html += '<section><div class="phase-title"><h3>Phase 0' + ph.id + ' · ' + esc(ph.name) + '</h3><span class="small muted">' + pd + '/' + items.length + '</span></div><div class="glass list">' +
        items.map(function (x) {
          var d = step(x.step), inner = sicon(x.status, x.step) + '<div class="li-main"><span class="li-title">' + x.step + '. ' + esc(d.title) + '</span><span class="li-sub">' + esc(d.summary) + ' · ' + d.minutes + ' min</span></div><div class="li-end">' + (x.status === 'locked' ? '' : pill(x.status) + ic('chev', 'chev')) + '</div>';
          return x.status === 'locked' ? '<div class="li" aria-disabled="true">' + inner + '</div>' : '<a class="li" href="#step-' + x.step + '">' + inner + '</a>';
        }).join('') + '</div></section>';
    });
    return { html: html };
  }

  /* ---------- member: feedback ---------- */
  async function vFeedback() {
    var subs = await S.submissions(me.id);
    var html = '<section class="page-head"><span class="eyebrow">History</span><h1>Feedback</h1><p class="muted">Everything you’ve submitted and what your mentors said.</p></section>';
    if (!subs.length) return { html: html + '<div class="glass empty">' + ic('chat') + '<b>No submissions yet</b><span>Your first task is waiting on the Today tab.</span></div>' };
    html += '<div class="glass list">' + subs.map(function (s) {
      var d = step(s.step);
      var sub = s.feedback ? '“' + esc(s.feedback) + '”' : 'Waiting for your mentor';
      return '<a class="li" href="#step-' + s.step + '">' + sicon(s.status, s.step) + '<div class="li-main"><span class="li-title">Step ' + s.step + ' · ' + esc(d.title) + '</span><span class="li-sub">' + sub + '</span></div><div class="li-end"><span class="small muted">' + rel(s.reviewedAt || s.createdAt) + '</span></div></a>';
    }).join('') + '</div>';
    return { html: html };
  }

  /* ---------- admin: overview ---------- */
  async function vOverview(stats) {
    var q = await S.queue(), apps = (await S.applications()).filter(function (a) { return a.status === 'new'; });
    var html = '<section class="page-head"><span class="eyebrow">' + today() + '</span><h1>' + greet() + ', ' + first(me.name) + '.</h1><p class="muted">' + (stats.pending ? stats.pending + ' submission' + (stats.pending > 1 ? 's are' : ' is') + ' waiting for your review.' : 'You’re all caught up.') + '</p></section>' +
      '<div class="stats">' +
        '<a class="stat glass' + (stats.pending ? ' hot' : '') + '" href="#reviews"><b>' + stats.pending + '</b><span>Waiting for review</span></a>' +
        '<a class="stat glass" href="#members"><b>' + stats.members + '</b><span>Active members</span></a>' +
        '<a class="stat glass" href="#applications"><b>' + stats.applications + '</b><span>New applications</span></a>' +
        '<div class="stat glass"><b>' + stats.approvedWeek + '</b><span>Approved this week</span></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<section class="stack"><div class="phase-title"><h3>Review queue</h3><a class="small" href="#reviews">See all</a></div>' + queueList(q.slice(0, 4)) + '</section>' +
        '<section class="stack"><div class="phase-title"><h3>New applications</h3><a class="small" href="#applications">See all</a></div>' +
          (apps.length ? '<div class="glass list">' + apps.slice(0, 3).map(function (a) {
            return '<a class="li" href="#applications"><span class="avatar">' + initials(a.name) + '</span><div class="li-main"><span class="li-title">' + esc(a.name) + '</span><span class="li-sub">' + esc(a.level) + '</span></div><div class="li-end"><span class="small muted">' + rel(a.createdAt) + '</span></div></a>';
          }).join('') + '</div>' : '<div class="glass empty"><span>No new applications.</span></div>') +
        '</section>' +
      '</div>';
    return { html: html };
  }
  function queueList(q) {
    if (!q.length) return '<div class="glass empty">' + ic('done') + '<b>All caught up</b><span>New submissions will appear here.</span></div>';
    return '<div class="glass list">' + q.map(function (s) {
      var late = Date.now() - new Date(s.createdAt) > 48 * 3600e3;
      return '<a class="li" href="#review-' + esc(s.id) + '"><span class="avatar warm">' + initials(s.member.name) + '</span><div class="li-main"><span class="li-title">' + esc(s.member.name) + '</span><span class="li-sub">Step ' + s.step + ' · ' + esc(step(s.step).title) + ' · ' + rel(s.createdAt) + '</span></div><div class="li-end">' + (late ? '<span class="pill revision">Over 48h</span>' : pill('review')) + ic('chev', 'chev') + '</div></a>';
    }).join('') + '</div>';
  }

  /* ---------- admin: reviews ---------- */
  async function vReviews() {
    var q = await S.queue();
    return { html: '<section class="page-head"><span class="eyebrow">Oldest first</span><h1>Reviews</h1><p class="muted">' + (q.length ? q.length + ' waiting. Aim to reply within 48 hours.' : 'Nothing waiting right now.') + '</p></section>' + queueList(q) };
  }

  async function vReview(id) {
    var s = await S.submission(id);
    if (!s) return { html: '<a class="back" href="#reviews">' + ic('back', 'chev') + 'Reviews</a><div class="glass empty"><b>Submission not found</b></div>' };
    var d = step(s.step), ph = phaseOf(s.step), open = s.status === 'review';
    var html = '<a class="back" href="#reviews">' + ic('back', 'chev') + 'Reviews</a>' +
      '<a class="glass card row" href="#member-' + esc(s.userId) + '" style="text-decoration:none;color:inherit"><span class="avatar lg warm">' + initials(s.member.name) + '</span><div class="li-main"><h3>' + esc(s.member.name) + '</h3><span class="small muted">' + esc(s.member.college || '') + '</span></div>' + ic('chev', 'chev') + '</a>' +
      (waNumber(s.member.phone) ? '<div class="row">' + waButton(waNumber(s.member.phone), 'Hi ' + s.member.name.split(' ')[0] + ', about your Step ' + s.step + ' submission on Researchette: ', 'WhatsApp ' + s.member.name.split(' ')[0], 'btn-sm') + '</div>' : '') +
      '<article class="glass card stack-lg">' +
        '<div class="step-head"><div class="row spread wrap"><span class="eyebrow">Phase 0' + ph.id + ' · ' + esc(ph.name) + '</span>' + pill(s.status) + '</div><h2>Step ' + s.step + ' · ' + esc(d.title) + '</h2></div>' +
        '<div class="stack"><span class="small muted"><b>Task:</b> ' + esc(d.task.prompt) + '</span></div>' +
        '<div class="stack"><div class="row spread"><span class="eyebrow">Submission</span><span class="small muted">' + rel(s.createdAt) + ' · ' + words(s.text) + ' words</span></div><div class="paper">' + esc(s.text) + '</div></div>' +
        (s.history.length ? '<details><summary class="small muted" style="cursor:pointer">Earlier attempts (' + s.history.length + ')</summary><div class="stack" style="margin-top:12px">' + s.history.map(function (h) {
          return '<div class="note ' + (h.status === 'approved' ? 'teal' : 'red') + '"><span class="small muted">' + rel(h.createdAt) + '</span><div class="paper">' + esc(h.text) + '</div>' + (h.feedback ? '<p class="fb">' + esc(h.feedback) + '</p>' : '') + (h.reviewer ? '<div class="by">' + esc(h.reviewer.name) + '</div>' : '') + '</div>';
        }).join('') + '</div></details>' : '') +
        (open ?
          '<div class="stack"><label for="fb">Your feedback</label><div class="chips" id="quick">' +
            ['Clear and well structured.', 'Be more specific about the population.', 'Add a reference for this.', 'Check the formatting.'].map(function (c) { return '<button type="button" class="chip" style="cursor:pointer">' + c + '</button>'; }).join('') +
          '</div><textarea id="fb" placeholder="What’s good, what needs fixing, and how to fix it."></textarea><p class="error" id="fb-err" hidden></p>' +
          '<div class="actions"><button class="btn btn-glass" type="button" id="revise">Request changes</button><button class="btn btn-teal" type="button" id="approve">Approve</button></div></div>'
          : '<div class="note ' + (s.status === 'approved' ? 'teal' : 'red') + '"><b class="small">' + LABEL[s.status] + '</b>' + (s.feedback ? '<p class="fb">' + esc(s.feedback) + '</p>' : '') + '</div>') +
      '</article>';
    return {
      html: html, mount: function (m) {
        if (!open) return;
        var fb = m.querySelector('#fb'), err = m.querySelector('#fb-err');
        m.querySelectorAll('#quick .chip').forEach(function (c) { c.addEventListener('click', function () { fb.value = (fb.value.trim() ? fb.value.trim() + ' ' : '') + c.textContent; fb.focus(); }); });
        function act(decision) {
          var text = fb.value.trim();
          if (decision === 'revision' && !text) { err.textContent = 'Write what needs to change so the member knows how to fix it.'; err.hidden = false; fb.focus(); return; }
          if (!text) text = 'Well done. Approved.';
          S.review(id, decision, text, me.id).then(function () {
            toast(decision === 'approved' ? 'Approved. Step ' + (s.step + 1 <= 10 ? s.step + 1 + ' unlocked for ' : 'Roadmap complete for ') + s.member.name.split(' ')[0] : 'Sent back to ' + s.member.name.split(' ')[0]);
            go('reviews');
          }, function (e) { toast(e.message); });
        }
        m.querySelector('#approve').addEventListener('click', function () { act('approved'); });
        m.querySelector('#revise').addEventListener('click', function () { act('revision'); });
      }
    };
  }

  /* ---------- admin: members ---------- */
  function dots(states) { return '<div class="dots" aria-hidden="true">' + states.map(function (x) { return '<i class="' + x.status + '"></i>'; }).join('') + '</div>'; }
  async function vMembers() {
    var list = await S.members();
    var rows = function (arr) {
      if (!arr.length) return '<div class="empty"><span>No members match that search.</span></div>';
      return arr.map(function (u) {
        var st = u.current ? u.current.status : 'approved';
        return '<a class="li" href="#member-' + esc(u.id) + '" data-q="' + esc((u.name + ' ' + u.email + ' ' + (u.college || '')).toLowerCase()) + '"><span class="avatar warm">' + initials(u.name) + '</span><div class="li-main"><span class="li-title">' + esc(u.name) + '</span><span class="li-sub">' + esc(u.college || '') + '</span></div><div class="li-end"><span class="small muted">' + u.done + '/10</span>' + pill(st === 'current' ? 'current' : st) + '</div></a>';
      }).join('');
    };
    return {
      html: '<section class="page-head"><span class="eyebrow">' + list.length + ' members</span><h1>Members</h1></section>' +
        '<div class="search">' + ic('search') + '<input id="q" type="search" placeholder="Search by name, email or college" aria-label="Search members"></div>' +
        '<div class="glass list" id="mlist">' + rows(list) + '</div>',
      mount: function (m) {
        var q = m.querySelector('#q');
        q.addEventListener('input', function () {
          var v = q.value.trim().toLowerCase(), any = false;
          m.querySelectorAll('#mlist .li').forEach(function (r) { var hit = r.dataset.q.indexOf(v) > -1; r.hidden = !hit; any = any || hit; });
          var e = m.querySelector('#mlist .empty'); if (!any && !e) m.querySelector('#mlist').insertAdjacentHTML('beforeend', '<div class="empty"><span>No members match that search.</span></div>'); else if (any && e) e.remove();
        });
      }
    };
  }
  async function vMember(id) {
    var u = await S.member(id);
    if (!u) return { html: '<a class="back" href="#members">' + ic('back', 'chev') + 'Members</a><div class="glass empty"><b>Member not found</b></div>' };
    var subs = await S.submissions(id);
    var html = '<a class="back" href="#members">' + ic('back', 'chev') + 'Members</a>' +
      '<div class="glass card stack">' +
        '<div class="row"><span class="avatar lg warm">' + initials(u.name) + '</span><div class="li-main"><h2>' + esc(u.name) + '</h2><span class="small muted">' + esc(u.email) + (u.phone ? ' · ' + esc(u.phone) : '') + '</span></div></div>' +
        '<div class="row wrap wa-row">' + (waNumber(u.phone)
          ? waButton(waNumber(u.phone), 'Hi ' + u.name.split(' ')[0] + ', this is ' + me.name.split(' ')[0] + ' from Researchette.', 'WhatsApp ' + u.name.split(' ')[0]) + '<button class="btn btn-quiet btn-sm" type="button" id="edit-phone">Change number</button>'
          : '<button class="btn btn-glass btn-sm" type="button" id="edit-phone">' + ic('wa') + 'Add WhatsApp number</button>') + '</div>' +
        '<form class="row wrap" id="phone-form" hidden><input id="phone-in" type="tel" inputmode="tel" placeholder="03xx xxxxxxx" value="' + esc(u.phone || '') + '" style="flex:1;min-width:180px" aria-label="WhatsApp number"><button class="btn btn-primary btn-sm" type="submit">Save</button></form>' +
        '<div class="chips">' + [u.college, u.level, 'Joined ' + rel(u.joined)].filter(Boolean).map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>' +
        (u.topic ? '<p><span class="small muted">Study topic</span><br>' + esc(u.topic) + '</p>' : '') +
        '<div class="stack" style="gap:8px"><div class="row spread"><span class="small muted">Progress</span><span class="small"><b>' + u.done + '</b> of 10 approved</span></div>' + dots(u.states) + '</div>' +
      '</div>' +
      '<section class="stack"><div class="phase-title"><h3>Steps</h3></div><div class="glass list">' + u.states.map(function (x) {
        var s = x.submission, d = step(x.step);
        var inner = sicon(x.status, x.step) + '<div class="li-main"><span class="li-title">' + x.step + '. ' + esc(d.title) + '</span><span class="li-sub">' + (s ? 'Last submitted ' + rel(s.createdAt) : x.status === 'locked' ? 'Not unlocked yet' : 'Not started') + '</span></div><div class="li-end">' + pill(x.status) + (s ? ic('chev', 'chev') : '') + '</div>';
        return s ? '<a class="li" href="#review-' + esc(s.id) + '">' + inner + '</a>' : '<div class="li">' + inner + '</div>';
      }).join('') + '</div></section>' +
      (subs.length ? '<p class="small muted">' + subs.length + ' submissions in total.</p>' : '');
    return {
      html: html, mount: function (m) {
        var f = m.querySelector('#phone-form');
        m.querySelector('#edit-phone').addEventListener('click', function () { f.hidden = false; f.querySelector('input').focus(); });
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var v = f.querySelector('input').value;
          if (v.trim() && !waNumber(v)) { toast('Enter a full number, like 0339 5888444'); return; }
          S.setPhone(id, v).then(function () { toast(v.trim() ? 'Number saved' : 'Number removed'); render(); });
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
        (waNumber(a.phone) ? '<div class="row">' + waButton(waNumber(a.phone), 'Hi ' + a.name.split(' ')[0] + ', thank you for applying to Researchette!', 'WhatsApp ' + a.name.split(' ')[0], 'btn-sm') + '</div>' : '') +
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
    S.approveApplication(a.id).then(function (res) {
      var portal = location.href.split('#')[0];
      var msg = 'Welcome to Researchette, ' + a.name.split(' ')[0] + '!\n\nYour member portal login:\nEmail: ' + res.user.email + '\nPassword: ' + res.password + '\n\nLog in here: ' + portal + '\nYour first task is waiting.';
      sheet('<span class="stamp">Welcome aboard</span><h2>Login created for ' + esc(a.name) + '</h2><p class="muted">Send these details to the student by email or WhatsApp. For security, the password is only shown once.</p>' +
        '<div class="cred"><span>Email</span><b>' + esc(res.user.email) + '</b></div><div class="cred"><span>Temporary password</span><b id="pw">' + esc(res.password) + '</b></div>' +
        '<pre class="paper small" id="msg" style="margin:0;font-family:var(--f-body)">' + esc(msg) + '</pre>' +
        '<button class="btn btn-primary btn-block" type="button" id="cp">Copy welcome message</button><button class="btn btn-quiet btn-block btn-sm" type="button" data-close>Done</button>',
        function (el, close) {
          el.querySelector('#cp').addEventListener('click', function () { copy(msg, el.querySelector('#msg')); });
          el.querySelector('[data-close]').addEventListener('click', render);
        });
    }, function (e) { toast(e.message); });
  }

  /* ---------- ripple ---------- */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn'); if (!b || reduce) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement('span');
    sp.className = 'ripple'; sp.style.width = sp.style.height = s + 'px';
    sp.style.left = (e.clientX - r.left - s / 2) + 'px'; sp.style.top = (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(sp); setTimeout(function () { sp.remove(); }, 650);
  });

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
