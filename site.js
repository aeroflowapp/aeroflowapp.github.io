// QuellHeat site — the whole motion layer, plus the goal meter.
//
// Reveal: elements marked [data-reveal] fade/rise in the first time they
// scroll into view. Everything is VISIBLE by default and only hidden once this
// script has decided it is genuinely below the fold (.will-reveal) — so a
// blocked or failed script leaves a perfectly readable page, above-the-fold
// content paints immediately, and nothing ever flashes. Reduced Motion is
// honoured in CSS (the classes become no-ops), so this file doesn't branch.
//
// Meter: the goal bar's fill and printed figure come from ONE hand-edited
// attribute (data-raised on .meter) — see the OWNER note in index.html. This
// page fetches nothing (CSP connect-src 'none'), so the number is updated by
// a person, on purpose, and the copy beside it says so.
(function () {
  "use strict";

  var meter = document.querySelector(".meter[data-raised]");
  if (meter) {
    var raised = Math.max(0, parseInt(meter.getAttribute("data-raised"), 10) || 0);
    var goal = parseInt(meter.getAttribute("data-goal"), 10) || 10000;
    var fill = meter.querySelector(".meter-fill");
    if (fill) fill.style.width = Math.min(100, (raised / goal) * 100) + "%";
    var label = document.querySelector("[data-raised-label]");
    if (label) label.textContent = "$" + raised.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (!els.length || !("IntersectionObserver" in window)) return;

  var fold = window.innerHeight * 0.92;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  els.forEach(function (el) {
    if (el.getBoundingClientRect().top > fold) {
      el.classList.add("will-reveal");
      io.observe(el);
    }
  });
})();
