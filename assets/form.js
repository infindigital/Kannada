/* the sign-up form.
   Each page loads only the behaviour it uses, so this bails out
   quietly when its root element is not on the page. */
(function () {
  'use strict';

  if (!document.getElementById('enrolForm')) return;

  /* ---------- enrol form ---------- */
  var form = document.getElementById('enrolForm');
  var field = document.getElementById('enrolEmail');
  var out = document.getElementById('enrolStatus');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!field.value || !field.checkValidity()) {
      out.textContent = 'ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.';
      field.focus();
      return;
    }
    form.hidden = true;
    out.textContent = '✓ ಧನ್ಯವಾದಗಳು! ಪ್ರವೇಶ ತೆರೆದಾಗ ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ.';
  });
})();
