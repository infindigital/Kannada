/* the ವೀಡಿಯೊ ಸಂಗ್ರಹ player.
   Wired per section rather than by id, so the library can appear on the home
   page and on its own page without the two sharing one player. */
(function () {
  'use strict';

  Array.prototype.forEach.call(document.querySelectorAll('.vlib'), function (root) {
    var vPlayer = root.querySelector('video');
    if (!vPlayer) return;

    /* a YouTube or Vimeo link is a page, not a media file, so it needs an
       iframe; a .mp4 needs <video>. Both are in the markup and one is shown. */
    var vFrame  = root.querySelector('.vlib-embed');
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

        var embed = item.dataset.embed;
        if (embed && vFrame) {
          /* stop the file player first: a hidden <video> left playing keeps
             its audio going underneath the embed */
          vPlayer.pause();
          vPlayer.hidden = true;
          vFrame.hidden = false;
          if (vFrame.src !== embed) vFrame.src = embed;
        } else {
          if (vFrame) { vFrame.hidden = true; vFrame.removeAttribute('src'); }
          vPlayer.hidden = false;

          /* only reload the media when the entry actually points somewhere
             else — otherwise selecting an entry would restart the clip
             already playing */
          var src = item.dataset.src;
          if (src && vPlayer.currentSrc.indexOf(src) === -1) {
            vPlayer.src = src;
            vPlayer.load();
          }
          var played = vPlayer.play();
          if (played && played.catch) played.catch(function () {});
        }

        vStatus.textContent = item.dataset.title + ' — ' + item.dataset.duration;
      });
    });
  });
})();
