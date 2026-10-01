/* Site menu for the public pages: one menu button in the top bar opens a panel with every page and
   section of the site, on phones and laptops alike, so the top bar stays clean (logo, theme, Join, menu). */
(function () {
  var links = document.querySelector('.nav .nav-links');
  if (!links) return;
  // the host may serve pages with or without ".html" (/research or /research.html)
  var page = function (u) { return (u.split('#')[0].replace(/\/$/, '').split('/').pop() || 'index').replace(/\.html$/, ''); };
  var here = page(location.pathname), home = here === 'index';
  var at = function (hash) { return (home ? '' : '/') + hash; };   // root links, so pages in folders (/learn/…) work too
  var I = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    book: '<path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M20 19v2H6"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8S10 3 7.5 4.5 9 8 12 8zm0 0s2-5 4.5-3.5S15 8 12 8z"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    paper: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    badge: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/><path d="M9.5 9l1.8 1.8L14.8 7.5"/>',
    cap: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>'
  };
  var ic = function (n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; };
  var ITEMS = [
    ['Home', home ? '#top' : '/', 'home'],
    ['Programmes', at('#tracks'), 'book'],
    ['Roadmap', at('#roadmap'), 'map'],
    ['Learn research', '/learn/', 'cap'],
    ['Free guides', '/guides', 'gift'],
    ['Mentors', at('#mentors'), 'users'],
    ['Student publications', '/research', 'paper', 'pub'],
    ['Reviews', '/reviews', 'star'],
    ['Verify a certificate', '/verify', 'badge']
  ];

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'menu-btn'; btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'site-menu');
  btn.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span>';
  links.appendChild(btn);

  var bg = document.createElement('div'); bg.className = 'menu-bg'; bg.hidden = true;
  var panel = document.createElement('nav'); panel.className = 'menu-panel'; panel.id = 'site-menu'; panel.hidden = true; panel.setAttribute('aria-label', 'Site menu');
  panel.innerHTML = '<ul>' + ITEMS.map(function (x) {
    var cur = !home && x[1].indexOf('#') < 0 && page(x[1]) === here;
    return '<li><a class="' + (x[3] || '') + '" href="' + x[1] + '" data-name="' + x[0] + '"' + (cur ? ' aria-current="page"' : '') + '><span class="mi">' + ic(x[2]) + '</span>' + x[0] +
      '<svg class="mc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a></li>';
  }).join('') + '</ul>' +
    '<div class="menu-ctas"><a class="btn btn-glass" href="/portal">Log in</a><a class="btn btn-primary" href="' + at('#join') + '">Join us today</a></div>';
  document.body.appendChild(bg); document.body.appendChild(panel);

  var open = false, timer = 0, reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function place() {
    var n = document.querySelector('.nav'); panel.style.top = Math.round(n.getBoundingClientRect().bottom + 8) + 'px';
    // laptops: the dropdown lines up with the menu button's right edge
    panel.style.right = innerWidth > 860 ? Math.max(12, Math.round(document.documentElement.clientWidth - btn.getBoundingClientRect().right)) + 'px' : '';
  }
  /* on the home page, “You’re here” follows the section on screen, not just the page */
  var SECTIONS = [['tracks', 'Programmes'], ['roadmap', 'Roadmap'], ['guides', 'Free guides'], ['mentors', 'Mentors'], ['join', '']];
  function markSection() {
    if (!home) return;
    var line = innerHeight * .4, now = 'Home';
    SECTIONS.forEach(function (x) { var el = document.getElementById(x[0]); if (el && el.getBoundingClientRect().top <= line) now = x[1]; });
    panel.querySelectorAll('li a').forEach(function (a) { if (a.dataset.name === now) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  }
  function show() {
    clearTimeout(timer); open = true; place(); markSection();
    bg.hidden = panel.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.add('menu-open'); }); });
    btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
    document.addEventListener('keydown', key);
    var first = panel.querySelector('a'); if (first) first.focus({ preventScroll: true });
  }
  /* closes back along the path it opened on */
  function hide(focusBtn) {
    if (!open) return; open = false;
    document.documentElement.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Menu');
    document.removeEventListener('keydown', key);
    timer = setTimeout(function () { bg.hidden = panel.hidden = true; }, reduce.matches ? 0 : 260);
    if (focusBtn) btn.focus({ preventScroll: true });
  }
  function key(e) {
    if (e.key === 'Escape') hide(true);
    if (e.key === 'Tab') { /* keep focus inside the menu while it's open */
      var f = [btn].concat([].slice.call(panel.querySelectorAll('a'))), i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  }
  btn.addEventListener('click', function () { open ? hide() : show(); });
  bg.addEventListener('click', function () { hide(); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) hide(); });
  addEventListener('resize', function () { if (open) place(); });
})();

/* A one-time note about cookies. The site sets no tracking or advertising cookies; the only cookie is the
   portal login. The note shows once per browser and is dismissed for good with OK. */
(function () {
  try { if (localStorage.getItem('rt-cookie-ok')) return; } catch (e) { return; }
  var n = document.createElement('div');
  n.className = 'cookie-note'; n.setAttribute('role', 'region'); n.setAttribute('aria-label', 'Cookie notice');
  n.innerHTML = '<p>We use one essential cookie to keep you logged in. No tracking or ads. <a href="/privacy#cookies">Privacy</a></p><button type="button" class="btn btn-primary btn-sm">OK</button>';
  n.querySelector('button').addEventListener('click', function () { try { localStorage.setItem('rt-cookie-ok', '1'); } catch (e) {} n.remove(); });
  setTimeout(function () { document.body.appendChild(n); }, 1200);
})();
