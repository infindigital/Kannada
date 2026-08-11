/* the ಗ್ಯಾಲರಿ lightbox.
   Wired per section rather than by id, so the gallery can appear on the home
   page and on its own page, each opening its own dialog. */
(function () {
  'use strict';

  Array.prototype.forEach.call(document.querySelectorAll('.gal'), function (root) {
    var lb = root.querySelector('.lb');
    if (!lb) return;

    var shots   = Array.prototype.slice.call(root.querySelectorAll('.gal-item'));
    var lbImage = lb.querySelector('img');
    var lbCap   = lb.querySelector('.lb-cap');
    var lbCount = lb.querySelector('.lb-count');
    var lbFrom  = null;
    var lbIndex = 0;

    function lbShow(i) {
      lbIndex = (i + shots.length) % shots.length;
      var shot = shots[lbIndex];
      lbImage.src = shot.dataset.full;
      lbImage.alt = shot.querySelector('img').alt;
      lbCap.textContent = shot.dataset.caption;
      lbCount.textContent = (lbIndex + 1) + ' / ' + shots.length;
    }

    shots.forEach(function (shot) {
      shot.addEventListener('click', function () {
        lbFrom = shot;                    /* so focus can go back where it came from */
        lbShow(parseInt(shot.dataset.index, 10));
        /* showModal gives the focus trap and Escape handling for free */
        if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      });
    });

    lb.querySelector('.lb-prev').addEventListener('click', function () { lbShow(lbIndex - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { lbShow(lbIndex + 1); });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });

    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  lbShow(lbIndex - 1);
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    });

    /* clicking the backdrop closes: the dialog fills its own box, so a click
       whose target is the dialog itself landed outside the content */
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });

    lb.addEventListener('close', function () { if (lbFrom) lbFrom.focus(); });
  });
})();
