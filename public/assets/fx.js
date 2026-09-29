/* Shared pointer effects for every page: glass spotlight and card tilt.
   Scrolling is left to the browser (native scrolling is the smoothest on every device).
   Mouse/trackpad only; phones and reduced-motion users get the static design. */
(function () {
  /* mark the page while it scrolls so CSS can pause decorative animations (all devices) */
  var root = document.documentElement, idle = 0;
  /* once content slides under the top bar, a soft edge shadow fades in (see liquid.css) */
  var edge = function () { root.classList.toggle('scrolled', scrollY > 4); };
  edge();
  addEventListener('scroll', function () {
    edge();
    if (!root.classList.contains('is-scrolling')) root.classList.add('is-scrolling');
    clearTimeout(idle); idle = setTimeout(function () { root.classList.remove('is-scrolling'); }, 180);
  }, { passive: true });
  /* lets iOS Safari show :active press states the instant a finger lands */
  document.addEventListener('touchstart', function () {}, { passive: true });
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
