/* =========================================================
   LINUS TORVALDS — LEGACY LOG
   script.js — Scroll reveal logic only
   ========================================================= */

(function () {
  'use strict';

  /* ── Staggered reveal for timeline entries ── */
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          timelineObserver.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  /* ── Fade reveal for quote cards (staggered) ── */
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  /* ── Attach observers once DOM is ready ── */
  document.addEventListener('DOMContentLoaded', () => {

    // Timeline entries — slight stagger per card
    const timelineItems = document.querySelectorAll('[data-reveal]');
    timelineItems.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.06}s`;
      timelineObserver.observe(el);
    });

    // Quote cards — bigger stagger for cinematic feel
    const fadeItems = document.querySelectorAll('[data-reveal-fade]');
    fadeItems.forEach((el, i) => {
      el.dataset.delay = i * 160;
      fadeObserver.observe(el);
    });

  });

})();