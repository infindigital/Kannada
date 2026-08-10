/* the ಗ್ಯಾಲರಿ lightbox.
   Each page loads only the behaviour it uses, so this bails out
   quietly when its root element is not on the page. */
(function () {
  'use strict';

  if (!document.getElementById('lightbox')) return;

  /* ---------- ಚಿತ್ರ ಸಂಗ್ರಹ lightbox ---------- */
  var shots   = Array.prototype.slice.call(document.querySelectorAll('.gal-item'));
  var lb      = document.getElementById('lightbox');
  var lbImage = document.getElementById('lbImage');
  var lbCap   = document.getElementById('lbCap');
  var lbCount = document.getElementById('lbCount');
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

  document.getElementById('lbPrev').addEventListener('click', function () { lbShow(lbIndex - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { lbShow(lbIndex + 1); });
  document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });

  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
  });

  /* clicking the backdrop closes: the dialog fills its own box, so a click
     whose target is the dialog itself landed outside the content */
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });

  lb.addEventListener('close', function () { if (lbFrom) lbFrom.focus(); });
})();
