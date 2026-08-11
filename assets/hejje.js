/* the ನಮ್ಮ ಹೆಜ್ಜೆಗಳು coverflow.
   Wired per section rather than by id, so the same coverflow can appear on
   the home page and on its own page — and, in the folded single-file preview,
   in the same document — without the two fighting over one set of ids. */
(function () {
  'use strict';

  Array.prototype.forEach.call(document.querySelectorAll('.hejje'), function (root) {
    var stage = root.querySelector('.hejje-stage');
    if (!stage) return;

    var cards   = Array.prototype.slice.call(stage.querySelectorAll('.hejje-card'));
    var dots    = Array.prototype.slice.call(root.querySelectorAll('.hejje-dot'));
    var hStatus = root.querySelector('[role="status"]');
    var hIndex  = 0;

    function layout() {
      cards.forEach(function (card, i) {
        var o = i - hIndex;
        var far = Math.abs(o);
        /* the plates fan out sideways, tip away from the viewer, and dim
           with distance — the ones past the third rank drop out entirely */
        card.style.transform =
          'translate(-50%, 0)' +
          ' translateX(' + (o * 58) + '%)' +
          ' translateZ(' + (-far * 180) + 'px)' +
          ' rotateY(' + (-o * 24) + 'deg)' +
          ' scale(' + (1 - far * 0.05) + ')';
        card.style.zIndex = String(20 - far);
        /* on the light ground the shoulders recede by fading and desaturating —
           darkening them the way a dark section would just makes blots */
        card.style.opacity = far === 0 ? '1' : far === 1 ? '.62' : far === 2 ? '.3' : '0';
        card.style.filter = far === 0 ? 'none'
          : 'saturate(' + (far === 1 ? .8 : .6) + ') blur(' + Math.min(far, 2) + 'px)';
        card.style.visibility = far > 2 ? 'hidden' : 'visible';
        card.classList.toggle('is-current', far === 0);
        card.setAttribute('aria-hidden', far === 0 ? 'false' : 'true');
      });

      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', i === hIndex ? 'true' : 'false');
      });

      hStatus.textContent = (hIndex + 1) + ' / ' + cards.length + ' — ' +
        cards[hIndex].querySelector('.hejje-title').textContent;
    }

    function hGo(next) {
      hIndex = (next + cards.length) % cards.length;
      layout();
    }

    root.querySelector('.hejje-arrow.prev').addEventListener('click', function () { hGo(hIndex - 1); });
    root.querySelector('.hejje-arrow.next').addEventListener('click', function () { hGo(hIndex + 1); });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { hGo(parseInt(dot.dataset.index, 10)); });
    });

    /* click a shoulder plate to bring it to the front — but a swipe ends with a
       click too, and that one would land on whatever plate is under the finger
       and undo the swipe, so it gets swallowed */
    var swiped = false;
    stage.addEventListener('click', function (e) {
      if (swiped) { swiped = false; return; }
      var card = e.target.closest('.hejje-card');
      if (card) hGo(parseInt(card.dataset.index, 10));
    });

    /* arrow keys anywhere in the section */
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  hGo(hIndex - 1);
      if (e.key === 'ArrowRight') hGo(hIndex + 1);
    });

    /* swipe */
    var swipeFrom = null;
    stage.addEventListener('pointerdown', function (e) { swipeFrom = e.clientX; swiped = false; });
    stage.addEventListener('pointerup', function (e) {
      if (swipeFrom === null) return;
      var dx = e.clientX - swipeFrom;
      swipeFrom = null;
      if (Math.abs(dx) > 40) {
        swiped = true;
        hGo(hIndex + (dx < 0 ? 1 : -1));
      }
    });
    stage.addEventListener('pointercancel', function () { swipeFrom = null; });

    layout();
  });
})();
