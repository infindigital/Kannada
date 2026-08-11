/* the ವೀಡಿಯೊ ಸಂಗ್ರಹ player.
   Wired per section rather than by id, so the library can appear on the home
   page and on its own page without the two sharing one player. */
(function () {
  'use strict';

  Array.prototype.forEach.call(document.querySelectorAll('.vlib'), function (root) {
    var vPlayer = root.querySelector('video');
    if (!vPlayer) return;

    var vItems  = Array.prototype.slice.call(root.querySelectorAll('.vlib-item'));
    var vNow    = root.querySelector('.vlib-now');
    var vTime   = root.querySelector('.vlib-time');
    var vStatus = root.querySelector('[role="status"]');

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
  });
})();
