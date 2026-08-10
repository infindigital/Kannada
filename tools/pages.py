#!/usr/bin/env python3
"""Write every page of the site from one set of shared chrome.

There is a page per menu entry, and each one carries the same header, the same
footer and the same fourteen links. Hand-maintaining that across sixteen files
is how a menu ends up disagreeing with itself, so the chrome lives here once and
the pages are generated from it.

    python3 tools/pages.py

Output is plain static HTML — no build step is needed to *serve* the site, only
to change its chrome. Per-page content lives in content/*.html and is copied in
verbatim; this file never edits it.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'

# ---------------------------------------------------------------- the menu
# (label, href, [(label, href), ...]) — a third element makes it a disclosure.
MENU = [
    ('ಮುಖಪುಟ', 'index.html', None),
    ('ಸಂಘಟನೆ', None, [
        ('ನಮ್ಮ ಸಂಘಟನೆಯ ಬಗ್ಗೆ', 'about.html'),
        ('ನಮ್ಮ ನಾಯಕರು', 'leaders.html'),
        ('ನಮ್ಮ ಹೆಜ್ಜೆಗಳು', 'journey.html'),
        ('ಜಿಲ್ಲೆಗಳು', 'districts.html'),
        ('ಸದಸ್ಯರು', 'members.html'),
    ]),
    ('ಕಾರ್ಯಕ್ರಮಗಳು', None, [
        ('ನಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳು', 'programmes.html'),
        ('ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳು', 'social.html'),
        ('ಹೋರಾಟಗಳು', 'campaigns.html'),
    ]),
    ('ಮಾಧ್ಯಮ', None, [
        ('ಮಾಧ್ಯಮ ವರದಿ', 'press.html'),
        ('ವೀಡಿಯೊ ಸಂಗ್ರಹ', 'videos.html'),
        ('ಗ್ಯಾಲರಿ', 'gallery.html'),
    ]),
    ('ಇನ್ನಷ್ಟು', None, [
        ('ಸದಸ್ಯತ್ವ', 'membership.html'),
        ('ಸಂಪರ್ಕಿಸಿ', 'contact.html'),
    ]),
]
CTA = ('ದೇಣಿಗೆ', 'donate.html')

# ---------------------------------------------------------------- the pages
# file -> (title, blurb, [content fragments], [scripts])
# A blurb of None means the page draws its own opening instead of a page head:
# only the home page does, because it opens on the video hero.
PAGES = {
    'index.html': ('ಮುಖಪುಟ', None, ['hero', 'home-intro', 'members', 'home-areas'],
                   ['hero.js']),
    'about.html': ('ನಮ್ಮ ಸಂಘಟನೆಯ ಬಗ್ಗೆ', 'ಕನ್ನಡ ಭಾಷೆ, ಸಂಸ್ಕೃತಿ, ನೆಲ ಮತ್ತು ಕನ್ನಡಿಗರ ಹಿತಾಸಕ್ತಿಗಳ ರಕ್ಷಣೆಗಾಗಿ.',
                   ['about'], []),
    'leaders.html': ('ನಮ್ಮ ನಾಯಕರು', 'ಸಂಘಟನೆಯನ್ನು ಮುನ್ನಡೆಸುತ್ತಿರುವವರು.',
                     ['talk'], []),
    'journey.html': ('ನಮ್ಮ ಹೆಜ್ಜೆಗಳು', 'ಇಲ್ಲಿಯವರೆಗಿನ ಹೋರಾಟದ ಹಾದಿ.',
                     ['hejje'], ['hejje.js']),
    'districts.html': ('ಜಿಲ್ಲೆಗಳು', 'ರಾಜ್ಯದ ಎಲ್ಲ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ನಮ್ಮ ಘಟಕಗಳು.',
                       ['districts'], []),
    'members.html': ('ಸದಸ್ಯರು', 'ಸಂಘಟನೆಯ ಸಂಖ್ಯಾಬಲ.', ['members'], []),
    'programmes.html': ('ನಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳು', 'ವರ್ಷವಿಡೀ ನಡೆಯುವ ಕೆಲಸ.',
                        ['programmes'], []),
    'social.html': ('ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳು', 'ಹೋರಾಟದ ಆಚೆಗಿನ ಸೇವೆ.',
                    ['social'], []),
    'campaigns.html': ('ಹೋರಾಟಗಳು', 'ಕರ್ನಾಟಕ ರಕ್ಷಣಾ ವೇದಿಕೆಯ ಹೋರಾಟದ ಹಾದಿ ಮತ್ತು ಸಂಘಟನೆಯ ಶಕ್ತಿ.',
                       ['news'], []),
    'press.html': ('ಮಾಧ್ಯಮ ವರದಿ', 'ಪತ್ರಿಕೆಗಳಲ್ಲಿ ನಮ್ಮ ಹೋರಾಟ.', ['press'], []),
    'videos.html': ('ವೀಡಿಯೊ ಸಂಗ್ರಹ', 'ಹೋರಾಟ ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳ ದೃಶ್ಯಗಳು.',
                    ['videos'], ['vlib.js']),
    'gallery.html': ('ಗ್ಯಾಲರಿ', 'ಬೀದಿಯಿಂದ ಬಂದ ಚಿತ್ರಗಳು.', ['gallery'], ['gallery.js']),
    'membership.html': ('ಸದಸ್ಯತ್ವ', 'ಸಂಘಟನೆಯ ಸದಸ್ಯರಾಗಿ.', ['membership'], ['form.js']),
    'donate.html': ('ದೇಣಿಗೆ', 'ನಿಮ್ಮ ಕೊಡುಗೆ ಹೋರಾಟಕ್ಕೆ ಬಲ.', ['donate'], []),
    'contact.html': ('ಸಂಪರ್ಕಿಸಿ', 'ನಮ್ಮನ್ನು ತಲುಪುವ ದಾರಿ.', ['contact'], ['contact.js']),
}

DESCRIPTION = 'ನಾಡು, ನುಡಿ, ನೆಲ, ಸಂಸ್ಕೃತಿ ಮತ್ತು ಕನ್ನಡಿಗರ ಹಕ್ಕುಗಳ ರಕ್ಷಣೆಗಾಗಿ ಒಗ್ಗಟ್ಟಿನ ಹೋರಾಟ.'
SITE = 'ಕರ್ನಾಟಕ ರಕ್ಷಣಾ ವೇದಿಕೆ'

CARET = ('<svg class="caret" width="11" height="11" viewBox="0 0 24 24" fill="none" '
         'aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" '
         'stroke-linecap="round" stroke-linejoin="round"/></svg>')


def flatten():
    """Every (label, href) in menu order, disclosures included."""
    for label, href, kids in MENU:
        if kids:
            for k in kids:
                yield k
        else:
            yield (label, href)
    yield CTA


def mark(href, here):
    """aria-current on the entry for the page being rendered.

    Applied to the link, and to the trigger of the disclosure holding it, so
    the header says where you are without relying on colour alone.
    """
    return ' aria-current="page"' if href == here else ''


def desktop_nav(here):
    out = ['      <nav class="nav-desktop" aria-label="ಮುಖ್ಯ ಮೆನು">']
    for i, (label, href, kids) in enumerate(MENU):
        if not kids:
            out.append('        <a class="nav-link" href="%s"%s>%s</a>'
                       % (href, mark(href, here), label))
            continue
        panel = 'menu-%d' % i
        inside = any(k[1] == here for k in kids)
        out.append('        <div class="nav-group">')
        out.append('          <button class="nav-trigger" type="button" aria-expanded="false" '
                   'aria-controls="%s"%s>' % (panel, ' data-current="true"' if inside else ''))
        out.append('            %s\n            %s' % (label, CARET))
        out.append('          </button>')
        out.append('          <div class="nav-panel" id="%s" hidden>' % panel)
        for klabel, khref in kids:
            out.append('            <a href="%s"%s>%s</a>' % (khref, mark(khref, here), klabel))
        out.append('          </div>')
        out.append('        </div>')
    out.append('        <a class="btn btn--primary nav-cta" href="%s"%s>%s</a>'
               % (CTA[1], mark(CTA[1], here), CTA[0]))
    out.append('      </nav>')
    return '\n'.join(out)


def mobile_nav(here):
    out = ['    <nav class="nav-mobile" id="navMobile" aria-label="ಮೊಬೈಲ್ ಮೆನು">']
    for label, href, kids in MENU:
        if not kids:
            out.append('      <a href="%s"%s>%s</a>' % (href, mark(href, here), label))
            continue
        out.append('      <h4>%s</h4>' % label)
        for klabel, khref in kids:
            out.append('      <a href="%s"%s>%s</a>' % (khref, mark(khref, here), klabel))
    out.append('      <a href="%s"%s>%s</a>' % (CTA[1], mark(CTA[1], here), CTA[0]))
    out.append('    </nav>')
    return '\n'.join(out)


def header(here):
    return """<header class="site-header">
  <div class="flag-rule"></div>
  <div class="wrap">
    <div class="header-inner">
      <a class="brand" href="index.html">
        <img class="brand-logo" src="assets/logo.png" width="245" height="220" alt="" />
        <span class="brand-word">ಕರ್ನಾಟಕ <span>ರಕ್ಷಣಾ ವೇದಿಕೆ</span></span>
      </a>

%s

      <button class="nav-toggle" type="button" id="navToggle"
              aria-label="ಮೆನು" aria-expanded="false" aria-controls="navMobile">
        <svg class="icon-open" width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
          <path d="M0 1h22M0 7h15M0 13h22" stroke="currentColor" stroke-width="1.6"/>
        </svg>
        <svg class="icon-close" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="1.6"/>
        </svg>
      </button>
    </div>

%s
  </div>
</header>""" % (desktop_nav(here), mobile_nav(here))


def footer_col(heading, entries):
    lis = '\n'.join('          <li><a href="%s">%s</a></li>' % (h, l) for l, h in entries)
    return '      <div>\n        <h3>%s</h3>\n        <ul>\n%s\n        </ul>\n      </div>' % (heading, lis)


def footer():
    return """<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <img class="footer-logo" src="assets/logo.png" width="245" height="220"
             alt="%s" />
        <p>ನಾಡು, ನುಡಿ, ನೆಲ ಮತ್ತು ಕನ್ನಡಿಗರ ಹಕ್ಕುಗಳ ರಕ್ಷಣೆಗಾಗಿ.</p>
      </div>

%s

%s

      <!-- TODO: the address, phone and email below are PLACEHOLDERS. Nothing
           here reaches anyone. Replace before this page is published. -->
      <div>
        <h3>ಸಂಪರ್ಕಿಸಿ</h3>
        <ul class="footer-contact">
          <li>ಕಚೇರಿಯ ವಿಳಾಸ ಇಲ್ಲಿ,<br />ಬೆಂಗಳೂರು – 560 001</li>
          <li><a href="tel:+910000000000">+91 00000 00000</a></li>
          <li><a href="mailto:name@example.org">name@example.org</a></li>
          <li><a href="membership.html">ಸದಸ್ಯತ್ವ</a></li>
          <li><a href="donate.html">ದೇಣಿಗೆ</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2026 %s.</p>
      <span class="footer-flag" aria-hidden="true">
        <i style="background:var(--yellow)"></i>
        <i style="background:var(--red)"></i>
      </span>
    </div>
  </div>
</footer>""" % (SITE, footer_col('ಸಂಘಟನೆ', MENU[1][2]), footer_col('ಕಾರ್ಯಕ್ರಮ', MENU[2][2] + [MENU[3][2][0]]), SITE)


def page_head(title, blurb):
    return """  <!-- ================= PAGE HEAD ================= -->
  <section class="page-head">
    <div class="wrap">
      <nav class="page-crumb" aria-label="ದಾರಿ">
        <a href="index.html">ಮುಖಪುಟ</a>
        <span aria-hidden="true">/</span>
        <span>%s</span>
      </nav>
      <h1>%s</h1>
      <p>%s</p>
    </div>
  </section>""" % (title, title, blurb)


def render(name):
    title, blurb, fragments, scripts = PAGES[name]
    body = []
    if blurb is not None:
        body.append(page_head(title, blurb))
    for n, frag in enumerate(fragments):
        text = (CONTENT / (frag + '.html')).read_text(encoding='utf-8').rstrip()
        # the page head already says what the section says, so the first
        # fragment on a category page loses its own heading block
        if blurb is not None and n == 0:
            text = re.sub(r'\n *<div class="section-head[^"]*">.*?</div>\n', '\n', text,
                          count=1, flags=re.S)
        body.append(text)

    tags = '\n'.join('<script src="assets/%s"></script>' % s for s in scripts)
    full = title if name == 'index.html' else '%s — %s' % (title, SITE)
    return """<!DOCTYPE html>
<html lang="kn">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>%s</title>
<meta name="description" content="%s" />
<meta name="theme-color" content="#FDF6EC" />
<meta property="og:title" content="%s" />
<meta property="og:description" content="%s" />
<meta property="og:type" content="website" />
<link rel="icon" type="image/png" href="assets/logo-mark.png" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;700&family=Anek+Kannada:wght@400;500;700&display=swap" rel="stylesheet" />

<link rel="stylesheet" href="assets/site.css" />
</head>

<body>
<a class="skip-link" href="#main">ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ</a>

%s

<main id="main">

%s

</main>

%s

%s
<script src="assets/nav.js"></script>
</body>
</html>
""" % (full, DESCRIPTION, full, blurb or DESCRIPTION,
       header(name), '\n\n'.join(body), footer(), tags)


def main():
    for name in PAGES:
        (ROOT / name).write_text(render(name), encoding='utf-8')
        print('wrote %-18s' % name)

    # campaign.html keeps its own hand-written body but shares the chrome
    path = ROOT / 'campaign.html'
    if path.exists():
        text = path.read_text(encoding='utf-8')
        for pat, new in ((r'<header class="site-header">.*?</header>', header('campaigns.html')),
                         (r'<footer class="site-footer".*?</footer>', footer())):
            text, n = re.subn(pat, lambda _m, v=new: v, text, flags=re.S)
            if n != 1:
                sys.exit('campaign.html: expected 1 match for %r, got %d' % (pat[:24], n))
        path.write_text(text, encoding='utf-8')
        print('wrote %-18s (chrome only)' % 'campaign.html')


if __name__ == '__main__':
    main()
