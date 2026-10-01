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

/* While the page is scrolling with a mouse or trackpad, hover effects wait. Otherwise every card that slides
   under a resting pointer lifts, tilts and lights up for a moment, which is a lot of redrawing mid-scroll.
   A transparent layer goes over the page while it moves (so nothing underneath reacts) and steps aside
   about a sixth of a second after scrolling stops. Only this one element changes, so it costs almost
   nothing; scrolling itself stays native, exactly as on phones. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var shield = document.createElement('div'), idle = 0, on = false;
  shield.setAttribute('aria-hidden', 'true');
  shield.style.cssText = 'position:fixed;inset:0;z-index:2147483646;pointer-events:none';
  function start() {
    if (!on) { on = true; shield.style.pointerEvents = 'auto'; }
    clearTimeout(idle); idle = setTimeout(function () { on = false; shield.style.pointerEvents = 'none'; }, 160);
  }
  function add() { document.body.appendChild(shield); addEventListener('scroll', start, { passive: true }); }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
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
