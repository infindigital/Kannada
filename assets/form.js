/* the ಸದಸ್ಯತ್ವ sign-up form.
   Wired per form rather than by id, so the band can appear on the home page
   and on its own page, each submitting independently. */
(function () {
  'use strict';

  Array.prototype.forEach.call(document.querySelectorAll('.enrol-form'), function (form) {
    var field = form.querySelector('input');
    /* the status line is a sibling of the form, not a child, so it stays put
       when the form hides itself */
    var out = form.parentNode.querySelector('.enrol-status');
    if (!field || !out) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!field.value || !field.checkValidity()) {
        out.textContent = 'ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.';
        field.focus();
        return;
      }
      form.hidden = true;
      out.textContent = '✓ ಧನ್ಯವಾದಗಳು! ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ.';
    });
  });
})();
