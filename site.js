// QuellHeat site — the whole motion layer.
//
// One job: elements marked [data-reveal] fade/rise in the first time they
// scroll into view. Everything is VISIBLE by default and only hidden once this
// script has decided it is genuinely below the fold (.will-reveal) — so a
// blocked or failed script leaves a perfectly readable page, above-the-fold
// content paints immediately, and nothing ever flashes. Reduced Motion is
// honoured in CSS (the classes become no-ops), so this file doesn't branch.
(function () {
  "use strict";
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
