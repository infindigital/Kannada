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

  // Headless CMS data layer. Source priority per section:
  //   1) WordPress REST API  (if window.KV_WP_BASE is set)
  //   2) local editor content (admin.html -> localStorage, same origin)
  //   3) the static markup already in the page (left untouched)
  (function () {
    var WP = (window.KV_WP_BASE || '').replace(/\/+$/, '');
    var STORE = 'kv_content_v1';
    var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var strip = function (h) { var d = document.createElement('div'); d.innerHTML = h || ''; return (d.textContent || '').trim(); };
    var ARROW = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    var PIN = '<svg class="w-4 h-4 text-brand-red" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-5.2-7-11a7 7 0 1114 0c0 5.8-7 11-7 11z" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="10" r="2.5"></circle></svg>';
    function programCard(p) {
      return '<div class="h-full"><article class="bg-white rounded-2xl border border-black/10 p-6 h-full flex flex-col hover:border-brand-gold hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">'
        + '<div class="flex items-start justify-between mb-5"><div class="bg-brand-red text-white rounded-xl w-16 py-2 flex flex-col items-center leading-none"><span class="font-serif text-2xl font-bold">' + esc(p.day) + '</span><span class="text-[10px] uppercase tracking-wider mt-1">' + esc(p.month) + '</span></div><span class="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-red bg-brand-red/10 px-3 py-1 rounded-full">' + esc(p.tag) + '</span></div>'
        + '<h3 class="font-serif text-xl font-bold text-[#1c1b1b] mb-2">' + esc(p.title) + '</h3><p class="text-sm text-[#5c3f3d] leading-relaxed mb-5 flex-1">' + esc(p.desc) + '</p>'
        + '<div class="flex items-center justify-between pt-4 border-t border-black/10"><span class="inline-flex items-center gap-1.5 text-xs text-[#5c3f3d]">' + PIN + ' ' + esc(p.place) + '</span><a class="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:gap-2 transition-all" href="#">ವಿವರ ' + ARROW + '</a></div></article></div>';
    }
    var BG = ['linear-gradient(135deg, #c62828 0%, #7a1414 100%)', 'linear-gradient(135deg, #e79a33 0%, #b5471a 100%)', 'linear-gradient(135deg, #8a1420 0%, #c62828 100%)'];
    var ICON = [
      '<svg class="absolute right-4 bottom-4 w-16 h-16 text-white/25" fill="none" stroke="currentColor" stroke-width="1.4" viewBox="0 0 24 24"><path d="M4 5h16v14H4z" stroke-linejoin="round"></path><path d="M4 5a2 2 0 012-2h6v16H6a2 2 0 00-2 2M20 5a2 2 0 00-2-2h-6" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      '<svg class="absolute right-4 bottom-4 w-16 h-16 text-white/25" fill="none" stroke="currentColor" stroke-width="1.4" viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      '<svg class="absolute right-4 bottom-4 w-16 h-16 text-white/25" fill="none" stroke="currentColor" stroke-width="1.4" viewBox="0 0 24 24"><path d="M4 22V4M4 4h11l-2 4 2 4H4" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
    ];
    function blogCard(b, i) {
      var k = i % 3;
      return '<div class="h-full"><article class="glass-card rounded-2xl overflow-hidden h-full flex flex-col hover:-translate-y-1.5 transition-transform duration-300">'
        + '<div class="relative h-44" style="background: ' + BG[k] + ';"><span class="absolute top-4 left-4 bg-black/40 backdrop-blur text-white text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full border border-white/20">' + esc(b.category) + '</span>' + ICON[k] + '</div>'
        + '<div class="p-6 flex flex-col flex-1"><div class="flex items-center gap-3 text-[11px] text-gray-400 mb-3"><span>' + esc(b.date) + '</span>' + (b.readtime ? '<span class="w-1 h-1 rounded-full bg-gray-500"></span><span>' + esc(b.readtime) + '</span>' : '') + '</div>'
        + '<h3 class="font-serif text-lg font-bold text-white mb-2 line-clamp-2">' + esc(b.title) + '</h3><p class="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-5 flex-1">' + esc(b.excerpt) + '</p>'
        + '<a class="inline-flex items-center gap-1 text-xs font-bold text-brand-gold hover:gap-2 transition-all mt-auto" href="#">ಓದಿರಿ ' + ARROW + '</a></div></article></div>';
    }
    function mediaCard(m) {
      return '<div class="h-full"><article class="glass-card rounded-2xl p-6 h-full flex flex-col hover:-translate-y-1.5 transition-transform duration-300">'
        + '<div class="flex items-center justify-between mb-4"><span class="text-xs font-bold text-brand-gold uppercase tracking-[0.12em]">' + esc(m.outlet) + '</span><span class="text-[11px] text-gray-500">' + esc(m.date) + '</span></div>'
        + '<h3 class="font-serif text-lg font-bold text-white leading-snug mb-4 flex-1">' + esc(m.headline) + '</h3>'
        + '<a class="inline-flex items-center gap-1 text-xs font-bold text-brand-gold hover:gap-2 transition-all mt-auto" href="#">ವರದಿ ಓದಿ ' + ARROW + '</a></article></div>';
    }
    var LG = [['#3a1414', '#7a1420'], ['#3a2410', '#8a4a16'], ['#2a1414', '#6d1420'], ['#33210f', '#9a5a1a'], ['#3a1414', '#7a1420'], ['#2a1a10', '#8a4a16']];
    var SIL = '<svg class="w-40 h-52" viewBox="0 0 160 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><circle cx="80" cy="76" r="34" fill="rgba(255,255,255,0.18)"></circle><path d="M26 200 C26 150 52 128 80 128 C108 128 134 150 134 200 Z" fill="rgba(255,255,255,0.18)"></path></svg>';
    function leaderCard(l, i) {
      var g = LG[i % LG.length];
      var nm = (l.name || '').trim();
      var title = nm ? esc(nm) : esc(l.role);
      var sub = nm ? esc(l.role) : 'ಕನ್ನಡ ವೇದಿಕೆ';
      return '<div class="h-full"><article class="glass-card rounded-2xl overflow-hidden h-full flex flex-col hover:-translate-y-1.5 transition-transform duration-300">'
        + '<div class="relative h-56 flex items-end justify-center" style="background: linear-gradient(160deg, ' + g[0] + ' 0%, ' + g[1] + ' 100%);">' + SIL + '</div>'
        + '<div class="p-6 text-center"><h3 class="font-serif text-lg font-bold text-white">' + title + '</h3><p class="text-[11px] text-brand-gold tracking-[0.15em] uppercase mt-1">' + sub + '</p></div></article></div>';
    }
    function moveItem(m, i, last) {
      var line = last ? '' : '<span class="w-px flex-1 bg-brand-gold/30 my-2"></span>';
      return '<div class="flex gap-5"><div class="flex flex-col items-center pt-1"><span class="w-4 h-4 rounded-full bg-brand-red ring-4 ring-brand-red/20 shrink-0"></span>' + line + '</div>'
        + '<div class="pb-10"><span class="font-serif text-2xl font-bold text-gold-gradient">' + esc(m.year) + '</span><h3 class="font-serif text-xl font-bold text-white mt-1 mb-2">' + esc(m.title) + '</h3><p class="text-gray-400 leading-relaxed max-w-2xl">' + esc(m.desc) + '</p></div></div>';
    }
    var R = { programs: programCard, blog: blogCard, media: mediaCard, leaders: leaderCard };

    // ---- WordPress mapping ----
    var WP_EP = { programs: 'program', movements: 'movement', leaders: 'leader', media: 'media_report', blog: 'posts' };
    function mapWp(type, it) {
      var m = it.meta || {};
      var t = strip(it.title && it.title.rendered);
      if (type === 'blog') {
        var cat = ''; try { cat = it._embedded['wp:term'][0][0].name; } catch (e) {}
        return { category: cat, date: (it.date || '').slice(0, 10), readtime: m.readtime || '', title: t, excerpt: strip(it.excerpt && it.excerpt.rendered) };
      }
      if (type === 'programs') return { day: m.day, month: m.month, tag: m.tag, title: t, place: m.place, desc: m.desc };
      if (type === 'movements') return { year: m.year, title: t, desc: m.desc };
      if (type === 'leaders') return { role: m.role || t, name: m.name || '' };
      if (type === 'media') return { outlet: m.outlet, date: m.date, headline: t };
      return {};
    }
    function fromWp(type) {
      if (!WP || !WP_EP[type] || typeof fetch !== 'function') return Promise.resolve(null);
      var qs = '?per_page=100' + (type === 'blog' ? '&_embed' : '');
      var host = WP.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      var isWpCom = /(^|\.)wordpress\.com$/i.test(host);
      var url = isWpCom
        ? ('https://public-api.wordpress.com/wp/v2/sites/' + host + '/' + WP_EP[type] + qs)
        : (WP + '/wp-json/wp/v2/' + WP_EP[type] + qs);
      return fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (arr) { return (arr || []).map(function (it) { return mapWp(type, it); }); })
        .catch(function () { return null; });
    }
    function fromLocal(type) {
      try { var d = JSON.parse(localStorage.getItem(STORE)); if (d && d[type]) return d[type]; } catch (e) {}
      return null;
    }
    function renderInto(el, type, list) {
      if (!list || !list.length) return;
      var lim = parseInt(el.getAttribute('data-cms-limit') || '0', 10); if (lim > 0) list = list.slice(0, lim);
      if (type === 'movements') { el.innerHTML = list.map(function (m, i) { return moveItem(m, i, i === list.length - 1); }).join(''); return; }
      var fn = R[type]; if (!fn) return; el.innerHTML = list.map(function (it, i) { return fn(it, i); }).join('');
    }
    // Exposed so the single-file preview router can re-render on route change.
    window.__hydrate = function (root) {
      root = root || document;
      Array.prototype.forEach.call(root.querySelectorAll('[data-cms]'), function (el) {
        var type = el.getAttribute('data-cms');
        fromWp(type).then(function (list) {
          if (list && list.length) { renderInto(el, type, list); return; }
          var loc = fromLocal(type);
          if (loc && loc.length) renderInto(el, type, loc);
        });
      });
    };
    window.__hydrate(document);
  })();
