/* Shared site scripts: nav toggle, scroll-reveal, coverflow, join form. All guarded. */
    // Reveal stat cards and count their numbers up as they scroll into view.
    (function () {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function finalText(el) {
        return (el.getAttribute('data-to') || '0') + (el.getAttribute('data-suffix') || '');
      }
      function countUp(el) {
        var target = parseInt(el.getAttribute('data-to'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce) { el.textContent = target + suffix; return; }
        var duration = 1400, start = null;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          el.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      var els = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window) || !els.length) {
        els.forEach(function (el) {
          el.classList.add('is-visible');
          el.querySelectorAll('.stat-count').forEach(function (c) { c.textContent = finalText(c); });
        });
        return;
      }
      // Enable the hide-then-reveal animation only now that JS is running.
      document.documentElement.classList.add('reveal-on');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.querySelectorAll('.stat-count').forEach(countUp);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      els.forEach(function (el) { io.observe(el); });
    })();
  
    // 3D coverflow for the "ನಮ್ಮ ಹೆಜ್ಜೆಗಳು" campaign cards.
    (function () {
      var cf = document.querySelector('.coverflow');
      if (!cf) return;
      var cards = Array.prototype.slice.call(cf.querySelectorAll('.cf-card'));
      var dotsWrap = document.querySelector('.cf-dots');
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var active = Math.floor(cards.length / 2); // start on the centre card (03)

      // Build dots
      var dots = cards.map(function (_, i) {
        var d = document.createElement('button');
        d.className = 'cf-dot';
        d.type = 'button';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'ಹೆಜ್ಜೆ ' + (i + 1));
        d.addEventListener('click', function () { go(i); });
        dotsWrap.appendChild(d);
        return d;
      });

      function layout() {
        cards.forEach(function (card, i) {
          var off = i - active;
          var abs = Math.abs(off);
          var sign = off < 0 ? -1 : 1;
          if (abs > 2) {
            card.style.opacity = '0';
            card.style.pointerEvents = 'none';
            card.style.transform = 'translateX(' + (sign * 150) + '%) scale(0.5)';
            card.style.zIndex = '0';
          } else {
            var tx = off * 48;
            var ry = -sign * Math.min(abs, 2) * 34;
            var sc = 1 - abs * 0.16;
            card.style.opacity = String(1 - abs * 0.30);
            card.style.pointerEvents = 'auto';
            card.style.transform = 'translateX(' + tx + '%) translateZ(' + (-abs * 130) + 'px) rotateY(' + ry + 'deg) scale(' + sc + ')';
            card.style.zIndex = String(30 - abs);
          }
          card.classList.toggle('is-active', off === 0);
          card.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
        });
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === active); });
      }

      function go(i) {
        active = Math.max(0, Math.min(cards.length - 1, i));
        layout();
      }

      cards.forEach(function (card, i) {
        card.addEventListener('click', function () { go(i); });
      });
      cf.querySelector('.cf-prev').addEventListener('click', function () { go(active - 1); });
      cf.querySelector('.cf-next').addEventListener('click', function () { go(active + 1); });
      cf.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { go(active - 1); }
        else if (e.key === 'ArrowRight') { go(active + 1); }
      });

      layout();

      // Gentle autoplay (skipped under reduced-motion); pauses on hover/focus.
      if (!reduce) {
        var timer = null;
        function start() { stop(); timer = setInterval(function () { go(active >= cards.length - 1 ? 0 : active + 1); }, 3800); }
        function stop() { if (timer) { clearInterval(timer); timer = null; } }
        cf.addEventListener('mouseenter', stop);
        cf.addEventListener('mouseleave', start);
        cf.addEventListener('focusin', stop);
        cf.addEventListener('focusout', start);
        start();
      }
    })();
  
    // Join form: show a thank-you message (no backend in this static demo).
    (function () {
      var form = document.getElementById('join-form');
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var msg = document.getElementById('join-success');
        if (msg) { msg.classList.remove('hidden'); msg.classList.add('flex'); }
        form.reset();
      });
    })();
  
    // Mobile nav toggle + close on link tap.
    (function () {
      var btn = document.getElementById('nav-menu-btn');
      var menu = document.getElementById('nav-mobile');
      if (!btn || !menu) return;
      function open() { menu.classList.remove('hidden'); menu.classList.add('flex'); btn.setAttribute('aria-expanded', 'true'); }
      function close() { menu.classList.add('hidden'); menu.classList.remove('flex'); btn.setAttribute('aria-expanded', 'false'); }
      btn.addEventListener('click', function () {
        if (menu.classList.contains('hidden')) { open(); } else { close(); }
      });
      menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    })();
  
