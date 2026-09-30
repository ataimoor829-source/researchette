/* Landing-page chat. A launcher sits in the corner; once per visit a greeting pops up from it with a soft chime.
   The panel answers common questions straight away, and anything a visitor types is handed to the team on
   WhatsApp (visitors aren't logged in, so the portal chat can't reach them).
   Sound: browsers only allow it after the visitor has tapped, clicked or pressed a key on the page, so the
   chime plays when that has happened; otherwise the greeting simply appears silently. */
(function () {
  var WA = '923395888444', EMAIL = 'itszainr1@gmail.com';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ss = function (k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } };
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* questions people ask most, answered from what the site already says */
  var QA = [
    ['How does it work?', 'You pick a programme, like an original article or a case report. Each day you get one small step: a short lesson, an example and a task. You write it, and a mentor corrects it within 48 hours. Step by step, you finish a real paper. 📄'],
    ['I’ve never done research', 'That’s completely fine! 😊 The roadmap starts from zero, even in first year, and every step is explained in simple words with examples.'],
    ['Who are the mentors?', 'Zain Ramzan (published researcher and journal reviewer, 50+ students mentored), Dr Maha Arshad (MD UCLA, orthopaedics resident at Stanford), Dr Sobia Ramzan (PhD Biochemistry, oncology) and Dr Alina (radiology resident, Huntsman Cancer Institute). You can read their messages on the Mentors page.'],
    ['How much time does it take?', 'About 30 to 60 minutes a day, at your own pace. ⏱️'],
    ['How do I join?', 'Tap “Join us today” and fill in the short form. We then email you the membership and payment details, and send your portal login once it’s confirmed. 🎉'],
    ['Will you write my paper?', 'No. You write it yourself and we correct every step. That keeps your work original, and you actually learn how to do it. ✍️'],
    ['Will I get published?', 'We guide you through choosing a journal, submitting and replying to reviewers. The final decision is the journal’s, but our mentored students have published.']
  ];

  var I = {
    chat: '<svg class="chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" stroke-width="2.6"/></svg>',
    x: '<svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    logo: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13h3l2-5 3 9 2-4h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    bellOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.7 21a2 2 0 0 1-3.4 0M18.6 13A17.9 17.9 0 0 1 18 8M6.3 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h14M18 8a6 6 0 0 0-9.3-5M2 2l20 20"/></svg>'
  };

  var root = document.createElement('div');
  root.className = 'rc';
  root.innerHTML =
    '<div class="rc-panel" id="rc-panel" role="dialog" aria-label="Chat with Researchette" hidden>' +
      '<div class="rc-head" tabindex="-1"><span class="rc-av">' + I.logo + '</span><div><b>Researchette</b><small>Usually replies within a few hours</small></div>' +
        '<button class="rc-mute" type="button"></button></div>' +
      '<div class="rc-body" aria-live="polite"></div>' +
      '<form class="rc-form"><textarea rows="1" placeholder="Type your question…" aria-label="Your question" maxlength="1000"></textarea><button class="rc-send" type="submit" aria-label="Send" disabled>' + I.send + '</button></form>' +
    '</div>' +
    '<div class="rc-hello" role="button" tabindex="0" hidden><button class="rc-close" type="button" aria-label="Hide this message">×</button><span class="rc-av">' + I.logo + '</span>' +
      '<div><b>Hi there! 👋</b><span>Got a question about research or joining? We’re happy to help.</span></div></div>' +
    '<button class="rc-btn" type="button" aria-label="Chat with us" aria-expanded="false" aria-controls="rc-panel">' + I.chat + I.x + '<span class="rc-dot" aria-hidden="true"></span><span class="rc-badge" aria-hidden="true">1</span></button>';
  document.body.appendChild(root);

  var btn = root.querySelector('.rc-btn'), panel = root.querySelector('.rc-panel'), hello = root.querySelector('.rc-hello');
  var body = root.querySelector('.rc-body'), form = root.querySelector('.rc-form'), ta = form.querySelector('textarea'), send = form.querySelector('.rc-send'), mute = root.querySelector('.rc-mute');
  var isOpen = false, started = false, asked = {};

  /* ---------- sound: a soft two-note chime made in the browser (no audio file) ---------- */
  var ctx = null;
  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { ctx = new AC(); } catch (e) { ctx = null; }
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { addEventListener(ev, unlock, { passive: true, capture: true }); });
  function chime() {
    if (!ctx || ctx.state !== 'running' || ls('rc-mute') === '1') return;
    var t = ctx.currentTime + .02, out = ctx.createGain(); out.gain.value = .9; out.connect(ctx.destination);
    [[880, 0], [1318.5, .13]].forEach(function (n) {
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = n[0]; o2.type = 'sine'; o2.frequency.value = n[0] * 2;
      var g2 = ctx.createGain(); g2.gain.value = .18; o2.connect(g2); g2.connect(g);
      o.connect(g); g.connect(out);
      g.gain.setValueAtTime(0, t + n[1]); g.gain.linearRampToValueAtTime(.12, t + n[1] + .012); g.gain.exponentialRampToValueAtTime(.0008, t + n[1] + .55);
      o.start(t + n[1]); o2.start(t + n[1]); o.stop(t + n[1] + .6); o2.stop(t + n[1] + .6);
    });
  }
  function drawMute() { var off = ls('rc-mute') === '1'; mute.innerHTML = off ? I.bellOff : I.bell; mute.setAttribute('aria-label', off ? 'Turn chat sound on' : 'Turn chat sound off'); }
  mute.addEventListener('click', function () { ls('rc-mute', ls('rc-mute') === '1' ? null : '1'); drawMute(); if (ls('rc-mute') !== '1') chime(); });
  drawMute();

  /* ---------- messages ---------- */
  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function add(html, who) { var m = document.createElement('div'); m.className = 'rc-msg ' + who; m.innerHTML = html; body.appendChild(m); scrollDown(); return m; }
  function typing(then) {
    var d = document.createElement('div'); d.className = 'rc-typing'; d.innerHTML = '<i></i><i></i><i></i>'; body.appendChild(d); scrollDown();
    setTimeout(function () { d.remove(); then(); }, reduce ? 150 : 650 + Math.random() * 350);
  }
  function chips() {
    body.querySelectorAll('.rc-chips').forEach(function (c) { c.remove(); });
    var left = QA.filter(function (q) { return !asked[q[0]]; });
    if (!left.length) return;
    var c = document.createElement('div'); c.className = 'rc-chips';
    c.innerHTML = left.map(function (q) { return '<button type="button">' + esc(q[0]) + '</button>'; }).join('');
    c.querySelectorAll('button').forEach(function (b, i) {
      b.style.animationDelay = (i * 40) + 'ms';
      b.addEventListener('click', function () { ask(left[i]); });
    });
    body.appendChild(c); scrollDown();
  }
  function ask(q) {
    asked[q[0]] = 1;
    body.querySelectorAll('.rc-chips').forEach(function (c) { c.remove(); });
    add(esc(q[0]), 'me');
    typing(function () { add(esc(q[1]), 'bot'); chips(); });
  }
  function handOff(text) {
    var msg = 'Hi Researchette! ' + text;
    var cta = document.createElement('div'); cta.className = 'rc-cta';
    cta.innerHTML = '<a class="wa" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">' + I.wa + 'Send on WhatsApp</a>' +
      '<a class="em" href="mailto:' + EMAIL + '?subject=' + encodeURIComponent('Question about Researchette') + '&body=' + encodeURIComponent(text) + '">or send it by email</a>';
    body.appendChild(cta); scrollDown();
  }
  function start() {
    if (started) return; started = true;
    add('Hi! 👋 Welcome to Researchette.\nPick a question below for an instant answer, or type your own and we’ll reply on WhatsApp.', 'bot');
    chips();
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = ta.value.trim(); if (!text) return;
    ta.value = ''; grow(); send.disabled = true;
    body.querySelectorAll('.rc-chips, .rc-cta').forEach(function (c) { c.remove(); });
    add(esc(text), 'me');
    typing(function () { add('Thanks for your question! 💙 Tap below to send it to our team on WhatsApp. We usually reply within a few hours.', 'bot'); handOff(text); });
  });
  function grow() { ta.style.height = 'auto'; ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; }
  ta.addEventListener('input', function () { send.disabled = !ta.value.trim(); grow(); });
  ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (ta.value.trim()) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); } });

  /* ---------- open, close, greeting ---------- */
  function leave(el, cls) { el.classList.add('out'); setTimeout(function () { el.hidden = true; el.classList.remove('out'); }, reduce ? 0 : 220); }
  function open() {
    if (isOpen) return; isOpen = true; unlock();
    if (!hello.hidden) leave(hello);
    root.classList.add('open'); root.classList.remove('unread');
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close chat');
    start();
    root.querySelector('.rc-head').focus({ preventScroll: true });
    ss('rc-hello', '1');
  }
  function close(focusBtn) {
    if (!isOpen) return; isOpen = false;
    root.classList.remove('open'); leave(panel);
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Chat with us');
    if (focusBtn) btn.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () { isOpen ? close() : open(); });
  hello.addEventListener('click', function (e) { if (e.target.closest('.rc-close')) return; open(); });
  hello.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  hello.querySelector('.rc-close').addEventListener('click', function (e) {
    e.stopPropagation(); leave(hello); root.classList.remove('unread');
    ls('rc-dismissed', String(Date.now())); // don't pop up again for a few days
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(true); });

  /* the greeting pops up once per visit: after 7 seconds, or once the visitor has scrolled a third of the page,
     but never while they're filling in the membership form, and not for 3 days after they closed it */
  var dismissed = +ls('rc-dismissed') || 0, shown = ss('rc-hello') === '1' || Date.now() - dismissed < 3 * 864e5;
  function greet() {
    if (shown || isOpen) return;
    var f = document.activeElement; if (f && f.closest && f.closest('form, .menu-panel')) { setTimeout(greet, 4000); return; }
    shown = true; ss('rc-hello', '1');
    hello.hidden = false; root.classList.add('unread'); chime();
    removeEventListener('scroll', onScroll);
  }
  function onScroll() { var h = document.documentElement.scrollHeight - innerHeight; if (h > 0 && scrollY / h > .33) greet(); }
  if (!shown) { setTimeout(greet, 7000); addEventListener('scroll', onScroll, { passive: true }); }
})();
