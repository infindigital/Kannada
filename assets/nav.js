/* Shared header behaviour. Loaded by every page; the page-specific
   sliders and lightbox stay inline where they are used. */
(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    navMobile.classList.remove('is-open');
  }

  navToggle.addEventListener('click', function () {
    var open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    navMobile.classList.toggle('is-open', !open);
  });

  navMobile.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
      navToggle.focus();
    }
  });
})();
