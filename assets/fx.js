/* Pointer effects shared by every page: glass spotlight, card tilt and magnetic buttons.
   Mouse/trackpad only; phones and reduced-motion users get the static design. */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var last = null, raf = 0, tilt = null, mag = null;

  function frame() {
    raf = 0;
    var e = last, t = e.target;
    if (!t || !t.closest) return;

    var g = t.closest('.glass');
    if (g) { var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    if (reduce) return;

    var c = t.closest('[data-tilt]');
    if (c !== tilt) { if (tilt) tilt.style.transform = ''; tilt = c; }
    if (c) {
      var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      c.style.transitionDelay = '0s';
      c.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    }

    var m = t.closest('.btn-primary');
    if (m !== mag) { if (mag) mag.style.translate = ''; mag = m; }
    if (m) {
      var q = m.getBoundingClientRect();
      m.style.translate = ((e.clientX - q.left - q.width / 2) * .18).toFixed(1) + 'px ' + ((e.clientY - q.top - q.height / 2) * .28).toFixed(1) + 'px';
    }
  }

  document.addEventListener('pointermove', function (e) { last = e; if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  document.addEventListener('pointerleave', function () {
    if (tilt) tilt.style.transform = ''; if (mag) mag.style.translate = ''; tilt = mag = null;
  });
})();
