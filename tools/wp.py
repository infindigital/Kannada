#!/usr/bin/env python3
"""Pull content from WordPress and write it into content/.

    python3 tools/wp.py && python3 tools/pages.py

WordPress is the CMS; the deployed site stays static HTML. This script talks to
the WP REST API, writes the section fragments and a manifest of posts, and
downloads every image it references into assets/wp/ so the published site has
no runtime dependency on WordPress at all — if the WP site is slow, moved or
down, the deployed pages are unaffected.

It uses **core WordPress only** — posts, categories, featured images, excerpts.
Nothing to install, no plugin, no custom post type. The mapping is:

    category slug   site section              what each post supplies
    -------------   -----------------------   ------------------------------
    horaatagalu     ಹೋರಾಟಗಳು                  featured image, title, date,
    karyakramagalu  ಕಾರ್ಯಕ್ರಮಗಳ ವರದಿ           body -> its own detail page
    gallery         ಗ್ಯಾಲರಿ                    featured image; title = caption
    videos          ವೀಡಿಯೊ ಸಂಗ್ರಹ              featured image = poster,
                                              excerpt = the video URL

Set WP_URL below. While it is empty this script does nothing and the
hand-written fragments already in content/ are left exactly as they are, so
the site keeps building either way.
"""

import html
import json
import pathlib
import re
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request

# The WordPress origin, no trailing slash — e.g. 'https://cms.example.org'.
# The REST API must be reachable at <WP_URL>/wp-json/wp/v2/ (it is, on a
# default install; some security plugins disable it).
WP_URL = ''

# category slug -> (fragment written, eyebrow, heading, lede)
FEEDS = {
    'horaatagalu': ('news', 'ವರದಿಗಳು', 'ಇತ್ತೀಚಿನ ಹೋರಾಟಗಳು',
                    'ಕರ್ನಾಟಕ ರಕ್ಷಣಾ ವೇದಿಕೆಯ ಹೋರಾಟದ ಹಾದಿ ಮತ್ತು ಸಂಘಟನೆಯ ಶಕ್ತಿ.'),
    'karyakramagalu': ('programme-posts', 'ವರದಿಗಳು', 'ಕಾರ್ಯಕ್ರಮಗಳ ವರದಿ',
                       'ನಡೆದ ಕಾರ್ಯಕ್ರಮಗಳ ವಿವರ ಮತ್ತು ಚಿತ್ರಗಳು.'),
}
GALLERY_SLUG = 'gallery'
VIDEO_SLUG = 'videos'
PER_PAGE = 24          # plenty for a section; WP caps this at 100

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'content'
WP_ASSETS = ROOT / 'assets' / 'wp'

MONTHS = ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್',
          'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್']

ARROW = ('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n'
         '                <path d="M14 5l7 7-7 7M21 12H3" stroke="currentColor" stroke-width="2.4"\n'
         '                      stroke-linecap="round" stroke-linejoin="round"/>\n'
         '              </svg>')


# ----------------------------------------------------------------- fetching
def api(path, **params):
    url = '%s/wp-json/wp/v2/%s' % (WP_URL.rstrip('/'), path)
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        sys.exit('WordPress returned %s for %s\n%s' % (e.code, url, e.read()[:300].decode('utf-8', 'replace')))
    except urllib.error.URLError as e:
        sys.exit('could not reach %s — %s' % (url, e.reason))


def category_id(slug):
    """The term id for a category slug, or None when the category is absent.

    Absent is not an error: a site that has not created ಗ್ಯಾಲರಿ yet should
    still build, keeping whatever fragment is already in content/.
    """
    found = api('categories', slug=slug, per_page=1)
    return found[0]['id'] if found else None


def posts_in(slug):
    cid = category_id(slug)
    if cid is None:
        print('  category %-16s not on the site — leaving its fragment alone' % slug)
        return None
    return api('posts', categories=cid, per_page=PER_PAGE, _embed='wp:featuredmedia',
               orderby='date', order='desc', status='publish')


# ----------------------------------------------------------------- helpers
def text(node):
    """WordPress gives rendered HTML for titles; the card wants plain text."""
    return html.unescape(re.sub(r'<[^>]+>', '', node.get('rendered', ''))).strip()


def kannada_date(iso):
    y, m, d = iso[:10].split('-')
    return '%s %s %s' % (d, MONTHS[int(m) - 1], y)


def slug_for(post):
    """A filename for a post's detail page.

    A Kannada title gives WordPress a percent-encoded slug, which makes an
    unreadable filename and a fragile URL, so anything that does not survive
    as plain ASCII falls back to the post id.
    """
    ascii_slug = re.sub(r'[^a-z0-9]+', '-', urllib.parse.unquote(post['slug']).lower()).strip('-')
    return 'post-%d-%s' % (post['id'], ascii_slug) if len(ascii_slug) >= 3 else 'post-%d' % post['id']


def featured(post):
    """(local image path, alt text) for a post's featured image, or None.

    The file is downloaded rather than hotlinked: the published site should not
    depend on WordPress being reachable to render a picture.
    """
    media = (post.get('_embedded') or {}).get('wp:featuredmedia') or []
    if not media or 'source_url' not in media[0]:
        return None
    src = media[0]['source_url']
    name = '%d-%s' % (post['id'], pathlib.Path(urllib.parse.urlparse(src).path).name)
    name = re.sub(r'[^A-Za-z0-9._-]', '_', name)
    dest = WP_ASSETS / name
    if not dest.exists():
        WP_ASSETS.mkdir(parents=True, exist_ok=True)
        try:
            with urllib.request.urlopen(src, timeout=60) as r, open(dest, 'wb') as f:
                shutil.copyfileobj(r, f)
            print('  downloaded assets/wp/%s' % name)
        except Exception as e:                                  # noqa: BLE001
            print('  could not download %s — %s' % (src, e))
            return None
    alt = media[0].get('alt_text') or text(post['title'])
    return 'assets/wp/%s' % name, alt


def esc(s):
    return html.escape(s, quote=True)


def embed_src(url):
    """(embed_url, None) for YouTube/Vimeo, (None, url) for a media file.

    A YouTube watch link cannot play in a <video> element — it is a web page,
    not a media file — so the two need different players, and which one an
    entry needs is decided here rather than left to fail silently at runtime.
    """
    yt = re.search(r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{6,})', url)
    if yt:
        return 'https://www.youtube-nocookie.com/embed/' + yt.group(1), None
    vim = re.search(r'vimeo\.com/(?:video/)?(\d+)', url)
    if vim:
        return 'https://player.vimeo.com/video/' + vim.group(1), None
    return None, url


# ----------------------------------------------------------------- fragments
def card(post, image, category):
    src, alt = image if image else ('assets/about-rally.svg', '')
    return """        <article class="card">
          <div class="card-figure">
            <img src="%s" alt="%s" width="800" height="500"
                 loading="lazy" decoding="async" />
            <span class="tag">%s</span>
          </div>
          <div class="card-body">
            <p class="card-date"><time datetime="%s">%s</time></p>
            <h3><a class="card-link" href="%s.html">%s</a></h3>
            <p class="card-more">
              ಹೆಚ್ಚು ತಿಳಿಯಿರಿ
              %s
            </p>
          </div>
        </article>
""" % (src, esc(alt), esc(category), post['date'][:10], kannada_date(post['date']),
       slug_for(post), esc(text(post['title'])), ARROW)


def feed_fragment(name, eyebrow, heading, lede, cards, alt_ground):
    return """  <!-- ================= %s ================= -->
  <!-- Generated by tools/wp.py from WordPress. Do not edit: the next fetch
       overwrites this file. Change the posts in WordPress instead. -->
  <section class="news%s" id="%s">
    <div class="wrap">

      <div class="news-head">
        <div class="section-head">
          <p class="eyebrow">%s</p>
          <h2>%s</h2>
          <p class="lede">
            %s
          </p>
        </div>
      </div>

      <div class="card-grid">

%s
      </div>
    </div>
  </section>
""" % (heading, ' is-alt' if alt_ground else '', name, eyebrow, heading, lede, ''.join(cards))


def gallery_fragment(items):
    """items: list of (src, alt, caption). The mosaic gives the first two tiles
    the wide and tall spans, exactly as the hand-written version did."""
    spans = ['gal-item is-wide', 'gal-item is-tall'] + ['gal-item'] * 40
    tiles = ''.join("""        <button class="%s" type="button" data-index="%d"
                data-full="%s" data-caption="%s">
          <img src="%s" alt="%s" width="900" height="600" loading="lazy" decoding="async" />
          <span class="gal-cap">%s</span>
        </button>
""" % (spans[i], i, src, esc(cap), src, esc(alt), esc(cap))
        for i, (src, alt, cap) in enumerate(items))

    return """  <!-- ================= ಗ್ಯಾಲರಿ ================= -->
  <!-- Generated by tools/wp.py from WordPress. Do not edit. -->
  <section class="gal" id="gallery">
    <div class="wrap">
      <div class="section-head is-centered">
        <p class="eyebrow is-centered">ಗ್ಯಾಲರಿ</p>
        <h2>ಬೀದಿಯಿಂದ ಬಂದ ಚಿತ್ರಗಳು</h2>
      </div>

      <div class="gal-grid">
%s      </div>
    </div>

    <dialog class="lb" id="lightbox" aria-label="ಚಿತ್ರ">
      <button class="lb-btn lb-close" type="button" id="lbClose" aria-label="ಮುಚ್ಚಿ">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="1.8"/>
        </svg>
      </button>
      <img id="lbImage" alt="" />
      <div class="lb-bar">
        <button class="lb-btn lb-prev" type="button" id="lbPrev" aria-label="ಹಿಂದಿನ ಚಿತ್ರ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <p class="lb-cap" id="lbCap"></p>
        <p class="lb-count" id="lbCount"></p>
        <button class="lb-btn lb-next" type="button" id="lbNext" aria-label="ಮುಂದಿನ ಚಿತ್ರ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </dialog>
  </section>
""" % tiles


def video_fragment(items):
    """items: list of (title, poster, url, duration)."""
    first = items[0]
    f_embed, f_file = embed_src(first[2])
    buttons = ''.join("""          <li>
            <button class="vlib-item" type="button"%s
                    data-title="%s" data-duration="%s"
                    data-poster="%s" %s="%s">
              <span class="vlib-thumb"><img src="%s" alt="" width="320" height="200"
                    loading="lazy" decoding="async" /></span>
              <span>
                <span class="vlib-name">%s</span>
                <span class="vlib-dur">%s</span>
              </span>
            </button>
          </li>
""" % (' aria-current="true"' if i == 0 else '', esc(t), esc(d), p,
       'data-embed' if embed_src(u)[0] else 'data-src', esc(embed_src(u)[0] or u),
       p, esc(t), esc(d))
        for i, (t, p, u, d) in enumerate(items))

    return """  <!-- ================= ವೀಡಿಯೊ ಸಂಗ್ರಹ ================= -->
  <!-- Generated by tools/wp.py from WordPress. Do not edit. -->
  <section class="vlib" id="videos">
    <div class="wrap">
      <div class="section-head is-centered">
        <p class="eyebrow is-centered">ವೀಡಿಯೊ ಸಂಗ್ರಹ</p>
        <h2>ಹೋರಾಟ ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳ ದೃಶ್ಯಗಳು</h2>
      </div>

      <div class="vlib-grid">
        <div class="vlib-stage">
          <!-- two players, one shown: a YouTube or Vimeo link is a page and
               needs an iframe, a media file needs <video>. vlib.js swaps them
               by which data attribute an entry carries. -->
          <video id="vlibPlayer" controls preload="metadata" playsinline
                 poster="%s"%s%s></video>
          <iframe class="vlib-embed" title="ವೀಡಿಯೊ"%s%s
                  allow="accelerated-2d-canvas; encrypted-media; picture-in-picture"
                  allowfullscreen></iframe>
          <p class="vlib-caption">
            <span class="vlib-now" id="vlibNow">%s</span>
            <span class="vlib-time" id="vlibTime">%s</span>
          </p>
        </div>

        <ul class="vlib-list" id="vlibList">
%s        </ul>
      </div>

      <p class="sr-only" role="status" aria-live="polite" id="vlibStatus"></p>
    </div>
  </section>
""" % (first[1],
       '' if f_embed else ' src="%s"' % esc(f_file), ' hidden' if f_embed else '',
       ' src="%s"' % esc(f_embed) if f_embed else '', '' if f_embed else ' hidden',
       esc(first[0]), esc(first[3]), buttons)


# ----------------------------------------------------------------- main
def main():
    if not WP_URL:
        print('WP_URL is empty in tools/wp.py — nothing fetched, content/ left as is.')
        return

    print('fetching from %s' % WP_URL)
    manifest = []

    for slug, (name, eyebrow, heading, lede) in FEEDS.items():
        posts = posts_in(slug)
        if posts is None:
            continue
        cards = []
        for p in posts:
            image = featured(p)
            cards.append(card(p, image, heading))
            manifest.append({
                'file': slug_for(p) + '.html',
                'title': text(p['title']),
                'date': p['date'][:10],
                'date_kn': kannada_date(p['date']),
                'category': heading,
                'back': 'campaigns.html' if slug == 'horaatagalu' else 'programmes.html',
                'image': image[0] if image else None,
                'alt': image[1] if image else '',
                'body': p['content']['rendered'],
                'excerpt': text(p.get('excerpt', {})),
            })
        (CONTENT / (name + '.html')).write_text(
            feed_fragment(name, eyebrow, heading, lede, cards,
                          alt_ground=(name == 'programme-posts')), encoding='utf-8')
        print('  wrote content/%-22s %d posts' % (name + '.html', len(posts)))

    gal = posts_in(GALLERY_SLUG)
    if gal:
        items = [(img[0], img[1], text(p['title']))
                 for p in gal for img in [featured(p)] if img]
        if items:
            (CONTENT / 'gallery.html').write_text(gallery_fragment(items), encoding='utf-8')
            print('  wrote content/%-22s %d pictures' % ('gallery.html', len(items)))

    vids = posts_in(VIDEO_SLUG)
    if vids:
        items = []
        for p in vids:
            img = featured(p)
            # the excerpt carries the video URL: it is a core field, editable
            # in the block editor sidebar, and exposed by the REST API without
            # registering any custom meta
            url = text(p.get('excerpt', {}))
            if not url.startswith('http'):
                print('  skipped video "%s" — its excerpt is not a URL' % text(p['title']))
                continue
            items.append((text(p['title']), img[0] if img else 'assets/page-flag.svg',
                          url, p.get('meta', {}).get('duration', '')))
        if items:
            (CONTENT / 'videos.html').write_text(video_fragment(items), encoding='utf-8')
            print('  wrote content/%-22s %d videos' % ('videos.html', len(items)))

    (CONTENT / 'posts.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print('  wrote content/%-22s %d detail pages queued' % ('posts.json', len(manifest)))
    print('\nnow run: python3 tools/pages.py')


if __name__ == '__main__':
    main()
