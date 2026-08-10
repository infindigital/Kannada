/* the hero book slider.
   Each page loads only the behaviour it uses, so this bails out
   quietly when its root element is not on the page. */
(function () {
  'use strict';

  if (!document.getElementById('hero')) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- the book slider ---------- */
  var book    = document.getElementById('hero');
  var track   = document.getElementById('bookTrack');
  var pages   = Array.prototype.slice.call(track.querySelectorAll('.hero-slide'));
  var bars    = Array.prototype.slice.call(document.querySelectorAll('.book-bar'));
  var current = document.getElementById('bookCurrent');
  var status  = document.getElementById('bookStatus');
  var toggle  = document.getElementById('bookToggle');
  var video   = document.getElementById('heroVideo');
  var chapter = document.getElementById('heroChapter');
  var title   = document.getElementById('heroTitle');

  var index = 0;
  var timer = null;
  var DELAY = 6500;
  var playing = false;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function render() {
    track.style.transform = 'translateX(' + (-index * 100) + '%)';

    /* parallax: media of each page counter-slides against the track,
       so pages read as separate leaves rather than one flat strip */
    pages.forEach(function (page, i) {
      var media = page.querySelector('.hero-media');
      if (media) media.style.setProperty('--parallax', ((i - index) * -14) + '%');
      page.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });

    bars.forEach(function (bar, i) {
      bar.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    chapter.textContent = pages[index].dataset.chapter;
    title.textContent   = pages[index].dataset.title;
    current.textContent = pad(index + 1);
    status.textContent = 'ಪುಟ ' + (index + 1) + ' / ' + pages.length;

    /* only the visible page's video should be running */
    if (video) {
      if (index === 0 && playing && !reduceMotion.matches) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        video.pause();
      }
    }
  }

  function goTo(next) {
    index = (next + pages.length) % pages.length;
    render();
  }

  function start() {
    if (reduceMotion.matches) return;
    stop();
    playing = true;
    toggle.dataset.state = 'playing';
    toggle.setAttribute('aria-label', 'ಸ್ಲೈಡ್‌ಶೋ ನಿಲ್ಲಿಸಿ');
    timer = setInterval(function () { goTo(index + 1); }, DELAY);
    if (video && index === 0) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  }

  function stop() {
    playing = false;
    toggle.dataset.state = 'paused';
    toggle.setAttribute('aria-label', 'ಸ್ಲೈಡ್‌ಶೋ ಪ್ರಾರಂಭಿಸಿ');
    if (timer) { clearInterval(timer); timer = null; }
    if (video) video.pause();
  }

  toggle.addEventListener('click', function () { playing ? stop() : start(); });
  document.getElementById('bookPrev').addEventListener('click', function () { stop(); goTo(index - 1); });
  document.getElementById('bookNext').addEventListener('click', function () { stop(); goTo(index + 1); });

  bars.forEach(function (bar) {
    bar.addEventListener('click', function () {
      stop();
      goTo(parseInt(bar.dataset.index, 10));
    });
  });

  /* arrow keys while the slider has focus */
  book.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { stop(); goTo(index - 1); }
    if (e.key === 'ArrowRight') { stop(); goTo(index + 1); }
  });

  /* pause while hovered or focused — never yank a page out from under someone */
  book.addEventListener('mouseenter', function () { if (playing) { clearInterval(timer); timer = null; } });
  book.addEventListener('mouseleave', function () { if (playing && !timer) start(); });
  book.addEventListener('focusin',   function () { if (playing) { clearInterval(timer); timer = null; } });

  /* and while the tab is in the background */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (timer) { clearInterval(timer); timer = null; } }
    else if (playing) start();
  });

  render();
  if (reduceMotion.matches) { stop(); } else { start(); }
  reduceMotion.addEventListener('change', function (e) { e.matches ? stop() : start(); });
})();
