/* AeroFlow site motion — vanilla, same-origin, ~3 KB.
 *
 * Deliberately NOT GSAP: a CDN copy would hand every visitor's IP to a third
 * party and force the CSP open, and vendoring the library costs ~70 KB to do
 * what four rAF-driven transforms do here. Everything below is transform- and
 * opacity-only (compositor properties), reads layout once per frame, and uses
 * passive listeners, so the page stays smooth on a fanless Air.
 *
 * EVERY effect is gated on prefers-reduced-motion. That is not decoration on a
 * site for a thermal utility whose own app treats Reduce Motion as binding.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── 1. Reveal on scroll ────────────────────────────────────────────────
     IntersectionObserver rather than a scroll handler: the browser does the
     work off the main thread and we only pay on the frames where something
     actually crosses the threshold. */
  function initReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduce.matches) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // Stagger children of a group so a row of cards arrives in sequence
        // rather than as one slab.
        var delay = parseFloat(e.target.getAttribute('data-delay') || '0');
        setTimeout(function () { e.target.classList.add('in'); }, delay * 1000);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── 2. Scroll parallax ─────────────────────────────────────────────────
     Depth by moving layers at different rates. Values are small on purpose:
     the aim is that you feel it and never catch it. */
  function initParallax() {
    var layers = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (!layers.length || reduce.matches) return;
    var ticking = false;

    function frame() {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        // Skip anything comfortably off-screen — no point transforming it.
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        // Progress from -1 (entering bottom) through 0 (centred) to 1 (leaving top).
        var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        el.style.transform = 'translate3d(0,' + (progress * speed * 100).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();
  }

  /* ── 3. 3-D tilt on the app shots ───────────────────────────────────────
     The screenshots are the product. Tilting them toward the pointer makes
     them read as objects on the page rather than flat images, which is the
     whole reason the app itself bothers with real refractive glass. */
  function initTilt() {
    var cards = [].slice.call(document.querySelectorAll('[data-tilt]'));
    if (!cards.length || reduce.matches) return;
    if (window.matchMedia('(hover: none)').matches) return; // touch: no pointer to follow

    cards.forEach(function (card) {
      var raf = null, tx = 0, ty = 0;
      function apply() {
        card.style.transform = 'perspective(1400px) rotateX(' + ty.toFixed(2) + 'deg) rotateY(' + tx.toFixed(2) + 'deg)';
        raf = null;
      }
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        // Max 3.2deg: past about 4 it stops reading as depth and starts
        // reading as a gimmick.
        tx = ((e.clientX - r.left) / r.width - 0.5) * 6.4;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 4.4;
        if (!raf) raf = requestAnimationFrame(apply);
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(apply);
      }, { passive: true });
    });
  }

  /* ── 4. Nav state ───────────────────────────────────────────────────────
     The nav earns its border and blur only once you have scrolled past the
     hero; at rest it should be invisible furniture. */
  function initNav() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var ticking = false;
    function frame() { nav.classList.toggle('scrolled', window.scrollY > 24); ticking = false; }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }, { passive: true });
    frame();
  }

  function init() {
    initReveal();
    initParallax();
    initTilt();
    initNav();
    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
