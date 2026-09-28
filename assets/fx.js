/* Shared motion for every page.
   - Smooth, eased scrolling for mouse wheels and trackpads (phones keep native scrolling).
   - Glass spotlight, card tilt and magnetic buttons on mouse/trackpad.
   Reduced-motion users get plain native behaviour. */
(function () {
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;
  var html = document.documentElement;

  /* ---------- smooth scrolling ---------- */
  var target = scrollY, current = scrollY, running = false, EASE = 0.1;
  function maxScroll() { return html.scrollHeight - innerHeight; }
  function navHeight() { var n = document.querySelector('.nav, .topbar'); return n ? n.offsetHeight : 0; }
  var lastT = 0;
  function start() { if (!running) { running = true; lastT = 0; requestAnimationFrame(tick); } }
  function stop() { running = false; target = current = scrollY; }
  function tick(now) {
    if (!running) return;
    var dt = lastT ? Math.min(now - lastT, 64) : 16.7; lastT = now;
    current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.7));
    if (Math.abs(target - current) < 0.5) { current = target; running = false; }
    scrollTo(0, current);
    if (running) requestAnimationFrame(tick);
  }
  function scrollsItself(el) {
    for (; el && el !== document.body && el !== html; el = el.parentElement) {
      if (el.matches('textarea, select, .sheet-bg, [data-native-scroll]')) return true;
      var cs = getComputedStyle(el);
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) return true;
    }
    return false;
  }
  addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.defaultPrevented) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (scrollsItself(e.target)) return;
    e.preventDefault();
    var d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1);
    if (!running) target = current = scrollY;
    target = Math.max(0, Math.min(maxScroll(), target + d));
    start();
  }, { passive: false });
  /* keyboard, scrollbar drags and scripted jumps: follow them instead of fighting */
  addEventListener('scroll', function () { if (!running) target = current = scrollY; }, { passive: true });
  addEventListener('keydown', stop);
  addEventListener('hashchange', stop);
  addEventListener('resize', function () { target = Math.min(target, maxScroll()); });
  /* in-page links glide to their section, below the sticky bar */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var el = id && document.getElementById(id);
    if (!el || el.id === 'app') return;
    e.preventDefault();
    target = id === 'top' ? 0 : Math.max(0, Math.min(maxScroll(), el.getBoundingClientRect().top + scrollY - navHeight() - 8));
    current = scrollY; start();
  });

  /* ---------- pointer effects ---------- */
  var last = null, raf = 0, tilt = null, mag = null;
  function frame() {
    raf = 0;
    var e = last, t = e.target;
    if (!t || !t.closest) return;
    var g = t.closest('.glass');
    if (g) { var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px'); }

    var c = t.closest('[data-tilt]');
    if (c !== tilt) { if (tilt) tilt.style.transform = ''; tilt = c; }
    if (c) {
      var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      c.style.transitionDelay = '0s';
      c.style.transform = 'perspective(900px) rotateX(' + (-y * 4).toFixed(2) + 'deg) rotateY(' + (x * 5).toFixed(2) + 'deg) translateY(-4px)';
    }

    var m = t.closest('.btn-primary');
    if (m !== mag) { if (mag) mag.style.translate = ''; mag = m; }
    if (m) {
      var q = m.getBoundingClientRect();
      m.style.translate = ((e.clientX - q.left - q.width / 2) * .16).toFixed(1) + 'px ' + ((e.clientY - q.top - q.height / 2) * .24).toFixed(1) + 'px';
    }
  }
  document.addEventListener('pointermove', function (e) { last = e; if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  document.addEventListener('pointerleave', function () {
    if (tilt) tilt.style.transform = ''; if (mag) mag.style.translate = ''; tilt = mag = null;
  });
})();
