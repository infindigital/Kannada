/* the ಸಂಪರ್ಕಿಸಿ form.
   Each page loads only the behaviour it uses, so this bails out
   quietly when its root element is not on the page. */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) return;

  var out = document.getElementById('contactStatus');

  /* checkValidity() covers required and the email type; reportValidity would
     also draw the browser's own bubble, which does not match the page, so the
     message is announced through the live region instead */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      out.textContent = 'ಎಲ್ಲ ಕಾಲಂಗಳನ್ನು ಸರಿಯಾಗಿ ಭರ್ತಿ ಮಾಡಿ.';
      var bad = form.querySelector(':invalid');
      if (bad) bad.focus();
      return;
    }
    form.hidden = true;
    out.textContent = '✓ ಧನ್ಯವಾದಗಳು! ಶೀಘ್ರದಲ್ಲೇ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತೇವೆ.';
  });
})();
