/* Shared pointer effects for every page: glass spotlight and card tilt.
   Scrolling is left to the browser (native scrolling is the smoothest on every device).
   Mouse/trackpad only; phones and reduced-motion users get the static design. */
(function () {
  /* once content slides under the top bar, a soft edge shadow fades in (see liquid.css). The class only
     changes when crossing the top of the page, so scrolling doesn't restyle the whole page. */
  var root = document.documentElement, on = null;
  var edge = function () { var s = scrollY > 4; if (s !== on) { on = s; root.classList.toggle('scrolled', s); } };
  edge();
  addEventListener('scroll', edge, { passive: true });
  /* lets iOS Safari show :active press states the instant a finger lands */
  document.addEventListener('touchstart', function () {}, { passive: true });
})();

/* number the children of every .stagger list, so CSS can bring them in one after another */
(function () {
  function number(root) { (root || document).querySelectorAll('.stagger').forEach(function (l) { [].forEach.call(l.children, function (c, i) { c.style.setProperty('--si', Math.min(i, 12)); }); }); }
  window.rtStagger = number;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { number(); }); else number();
})();

/* smooth scrolling for mouse wheels. Each wheel click is eased into a glide instead of a jump.
   Trackpads, touch screens, the keyboard and the scrollbar keep native scrolling; nothing changes
   for people who ask for reduced motion, or inside anything that scrolls on its own (lists, sheets, text boxes). */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var target = scrollY, pos = scrollY, running = false, lastT = 0;
  function max() { return document.documentElement.scrollHeight - innerHeight; }
  function scrollsItself(el, dy) {
    for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      var st = getComputedStyle(el);
      if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 1) {
        if ((dy < 0 && el.scrollTop > 0) || (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return true;
      }
    }
    return false;
  }
  function frame(t) {
    var dt = Math.min(64, t - (lastT || t)) || 16; lastT = t;
    pos += (target - pos) * (1 - Math.pow(1 - .16, dt / 16.7));
    if (Math.abs(target - pos) < .5) { pos = target; running = false; }
    window.scrollTo({ top: pos, behavior: 'instant' });
    if (running) requestAnimationFrame(frame); else lastT = 0;
  }
  addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    // a mouse wheel moves in big, even steps; trackpads send many small ones and are already smooth
    var line = e.deltaMode === 1, big = line || Math.abs(e.deltaY) >= 50 && Number.isInteger(e.deltaY);
    if (!big) { target = pos = scrollY; return; }
    if (scrollsItself(e.target, e.deltaY) || document.querySelector('.sheet-bg, .menu-open, .tour')) return;
    e.preventDefault();
    if (!running) { target = pos = scrollY; }
    target = Math.max(0, Math.min(max(), target + e.deltaY * (line ? 40 : 1)));
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: false });
  // anything else that scrolls the page (links, keys, scrollbar) takes over straight away
  addEventListener('scroll', function () { if (!running) target = pos = scrollY; }, { passive: true });
  addEventListener('keydown', function () { running = false; target = pos = scrollY; });
  addEventListener('mousedown', function () { running = false; target = pos = scrollY; });
})();

(function () {
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  /* ---------- pointer effects ---------- */
  var last = null, raf = 0, tilt = null;
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
  }
  document.addEventListener('pointermove', function (e) { last = e; if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  document.addEventListener('pointerleave', function () {
    if (tilt) tilt.style.transform = ''; tilt = null;
  });
})();
