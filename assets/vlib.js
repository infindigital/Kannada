/* the ವೀಡಿಯೊ ಸಂಗ್ರಹ player.
   Each page loads only the behaviour it uses, so this bails out
   quietly when its root element is not on the page. */
(function () {
  'use strict';

  if (!document.getElementById('vlibPlayer')) return;

  /* ---------- ವೀಡಿಯೊ ಸಂಗ್ರಹ ---------- */
  var vItems  = Array.prototype.slice.call(document.querySelectorAll('.vlib-item'));
  var vPlayer = document.getElementById('vlibPlayer');
  var vNow    = document.getElementById('vlibNow');
  var vTime   = document.getElementById('vlibTime');
  var vStatus = document.getElementById('vlibStatus');

  vItems.forEach(function (item) {
    item.addEventListener('click', function () {
      vItems.forEach(function (other) {
        other.setAttribute('aria-current', other === item ? 'true' : 'false');
      });

      vNow.textContent  = item.dataset.title;
      vTime.textContent = item.dataset.duration;
      vPlayer.poster    = item.dataset.poster;

      /* only reload the media when the entry actually points somewhere else —
         otherwise selecting an entry would restart the clip already playing */
      var src = item.dataset.src;
      if (src && vPlayer.currentSrc.indexOf(src) === -1) {
        vPlayer.src = src;
        vPlayer.load();
      }
      var played = vPlayer.play();
      if (played && played.catch) played.catch(function () {});

      vStatus.textContent = item.dataset.title + ' — ' + item.dataset.duration;
    });
  });
})();
