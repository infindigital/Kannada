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

  /* ---------- grouped menus ---------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.nav-trigger'));

  function closeMenus(except) {
    triggers.forEach(function (trigger) {
      if (trigger === except) return;
      trigger.setAttribute('aria-expanded', 'false');
      document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
    });
  }

  triggers.forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));

    /* toggled on click rather than hover: a hover menu is unreachable by
       touch and hard to travel to with a pointer */
    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('aria-expanded') === 'true';
      closeMenus(trigger);
      trigger.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });

    /* a choice made, or focus gone elsewhere in the header, closes it */
    panel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenus();
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-group')) closeMenus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = triggers.filter(function (t) { return t.getAttribute('aria-expanded') === 'true'; })[0];
    if (open) { closeMenus(); open.focus(); }
  });

  document.addEventListener('focusin', function (e) {
    if (!e.target.closest('.nav-group')) closeMenus();
  });

})();
