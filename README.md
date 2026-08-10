# Craft — ಸಿನಿಮ್ಯಾಟಿಕ್ ಕಥನ (Cinematic Storytelling)

A single-page course site in **Kannada (ಕನ್ನಡ)**: a **full-bleed video hero**
over a **light-theme** page in the Karnataka flag palette.

The hero is a **book-style slider**. Page one is the looping Karnataka flag
video; pages turn sideways over a shaded binding edge while the media inside
counter-slides, so they read as leaves of a book rather than one flat strip.
The chapter caption, page count and progress bars along the foot of the hero
track the current page.

## Files

- `index.html` — the home page. No build step, no CDN, no framework.
- `campaign.html` — the report detail page a card on the home page opens.
- `assets/site.css` — every style, shared by both pages. `url()` inside it
  resolves against the stylesheet, not the page, so asset paths in here carry
  no `assets/` prefix.
- `assets/nav.js` — the header behaviour, needed by every page: the mobile
  sheet and the grouped menus. The sliders, lightbox and player stay inline on
  the page that uses them.

- `assets/karnataka-flag.mp4` — looping Karnataka flag video, page 1 of the hero.
  Muted, autoplaying, `playsinline`, with a matching SVG poster so the hero is
  never blank while it loads.
- `assets/*.svg` — the page artwork (flag poster, Hampi colonnade, illuminated
  palace, a flag-raising crowd, raised fists, campaign plate, chariot
  procession, government building, village school).
  Vector, local, ~2–4 KB each, so the page renders complete with no network
  requests.
- `assets/logo-kannada.png` — the Karnataka Rakshana Vedike crest, 1024², as
  supplied. `assets/logo.png` (header, 220px tall) and `assets/logo-mark.png`
  (192px square, favicon) are derived from it by `tools/logo-prep.py`.

The crest is far too detailed to read at header size — a lion, a warrior,
ribbon lettering, a shield and crossed swords. So the header pairs it with a
wordmark: the crest carries the identity, the wordmark carries the name, and
the crest's `alt` is empty so screen readers hear the name once rather than
twice. The wordmark wraps to two lines under 620px instead of being hidden.

## Menu

The supplied menu is fourteen entries, which will not sit on one line. The four
that name a *group* of pages become click-toggled disclosures and the rest hang
under them — ಇನ್ನಷ್ಟು is the supplied list's own catch-all, so the shape was
already there:

| Top level | Under it |
|---|---|
| ಮುಖಪುಟ | — |
| ಸಂಘಟನೆ | ನಮ್ಮ ಸಂಘಟನೆಯ ಬಗ್ಗೆ · ನಮ್ಮ ನಾಯಕರು · ನಮ್ಮ ಹೆಜ್ಜೆಗಳು · ಜಿಲ್ಲೆಗಳು · ಸದಸ್ಯರು |
| ಕಾರ್ಯಕ್ರಮಗಳು | ನಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳು · ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳು · ಹೋರಾಟಗಳು |
| ಮಾಧ್ಯಮ | ಮಾಧ್ಯಮ ವರದಿ · ವೀಡಿಯೊ ಸಂಗ್ರಹ · ಗ್ಯಾಲರಿ |
| ಇನ್ನಷ್ಟು | ಸದಸ್ಯತ್ವ · ಸಂಪರ್ಕಿಸಿ |
| ದೇಣಿಗೆ | the call to action |

That measures 544px against the 626px free at 900px wide, so it fits from 900px
up with room to spare. The menus open on click rather than hover, since a hover
menu cannot be reached by touch; one opens at a time, Escape closes and returns
focus to its trigger, and a click or focus outside closes them. Below 900px the
whole set lists flat in the mobile sheet under its group headings.

Every entry lands on a real section — checked by resolving each `href` against
the ids actually present in the target file, not by reading the markup.

## Design system

| | |
|---|---|
| Surfaces | `#FDF6EC` cream · `#FFFFFF` · `#1A0800` deep (hero + one band) |
| Brand | `#D42A28` red · `#FFCC00` yellow · `#2F6E9E` blue · `#C9A227` gold |
| Type | Anek Latin → Anek Kannada, 400 / 500 / 700 |
| Radii | 2px controls · 6px cards · 14px the book |

One superfamily covers both scripts. Anek was drawn by Ek Type across nine
Indian scripts plus Latin, so the Kannada and the Latin share proportions,
weight and rhythm instead of being two unrelated faces set side by side — the
page has no seam where the scripts meet. Latin is still listed **first** in the
stack, since Anek Kannada also carries Latin glyphs and would otherwise win.

With one family, hierarchy comes from weight rather than from a serif/sans
contrast: 700 for headings and display numerals, 400 for text. Anek has no
italic, so nothing is set in one — a synthesised oblique distorts Kannada
conjuncts.

The four brand colors are read off the Karnataka Rakshana Vedike mark: the
ribbon's red, the map and flag's yellow, the guardians' steel blue, the
shield's bronze. Red carries emphasis and anything clickable; blue carries the
icon system, so the two never compete. Yellow and gold are **fills only** —
`#FFCC00` is 1.5:1 on cream and `#C9A227` is 2.4:1, so neither is ever set as
text on a light ground.

Everything is tokenised at the top of the `<style>` block — colors, radii,
shadows, easing, spacing and the type stacks — so the palette can be changed
in one place.

## Sections

Hero + book slider · ನಮ್ಮ ಸಂಘಟನೆಯ ಬಗ್ಗೆ · ಸದಸ್ಯರು · ನಮ್ಮ ನಾಯಕರು ·
ನಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳು · ನಮ್ಮ ಹೆಜ್ಜೆಗಳು (campaign coverflow) ·
ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳು · ಜಿಲ್ಲೆಗಳು · ವೀಡಿಯೊ ಸಂಗ್ರಹ (video library) ·
ಗ್ಯಾಲರಿ (image gallery) · ಹೋರಾಟಗಳು (recent campaigns) · ಮಾಧ್ಯಮ ವರದಿ ·
ದೇಣಿಗೆ · ಸದಸ್ಯತ್ವ · footer (ಸಂಪರ್ಕಿಸಿ).

Building the menu removed the last of the film-course content the page started
from: the stats strip is now the organisation's reach, the ಪಠ್ಯಕ್ರಮ tile grid is
now ನಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳು, the enrolment band is now ಸದಸ್ಯತ್ವ, and the footer
carries contact details rather than lesson links.

**ಜಿಲ್ಲೆಗಳು** lists Karnataka's 31 districts, which is a fact rather than a
placeholder — but the names carry no `href` yet, because what a district unit's
page should show has not been decided. The tiles under ನಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳು and
ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳು are `div`s for the same reason, with `.is-static`
dropping the pointer and the hover invert so they don't offer a click that does
nothing.

> The programme names, the social-work list, every press clipping, the member
> and taluk counts, the bank details and the footer's address, phone and email
> are **placeholders**. Nothing in the ದೇಣಿಗೆ block can receive money and
> nothing in the footer reaches anyone.

The **about** band carries the supplied portrait (`assets/narayana-guru.png`,
1.9 MB, served as a 98 KB JPEG) closed by the ನಾಡು · ನುಡಿ · ನೆಲ · ಸಂಸ್ಕೃತಿ
strip, which was a separate tile when that column was a three-part collage.

**ಚಿತ್ರ ಸಂಗ್ರಹ** is a mosaic, not an even grid — two tiles carry weight via
`is-wide` / `is-tall` spans and `grid-auto-flow: dense` packs the rest around
them, so adding a picture never leaves a hole. Captions ride in from the foot
on hover and focus rather than sitting over the picture.

The lightbox is a `<dialog>` opened with `showModal()`, which gives the focus
trap and Escape handling natively instead of hand-rolled key handling. It adds
prev/next, arrow keys, wrap-around, backdrop-click to close, and returns focus
to the tile that opened it.

> The pictures are page artwork and the captions are **placeholders**.

**ವೀಡಿಯೊ ಸಂಗ್ರಹ** is a working player, not a wall of thumbnails: a native
`<video>` with controls beside a scrolling playlist of real `<button>`s.
Selecting an entry swaps the poster, the caption and the duration, marks itself
`aria-current`, and announces through an `aria-live` line. Give a button a
`data-src` and the player loads it — without one it keeps the clip already
playing rather than restarting it.

> Every entry currently points at the one flag clip in `assets/`, the
> thumbnails are page artwork, and the titles and durations are
> **placeholders**.

**ಇತ್ತೀಚಿನ ಹೋರಾಟಗಳು** reuses the `.card` component rather than introducing a
second card style — image, place tag, date, headline, and a "know more" that
looks like a button but is a `<span>`. The whole card is already one stretched
link, so a real control there would be a second focus stop onto the same
target. The card bodies are flex columns so the buttons line up across cards
whose headlines run to different lengths.

> The place, date and headline on each of those cards are **placeholders**, and
> the images are existing page artwork standing in for photographs. No campaign
> shown is a recorded event.

Bands alternate ground so no two neighbours share a surface: dark, cream,
white, cream, white, cream, white, cream, dark, cream, white, cream, dark, red,
dark. Adding, moving or
removing a section means re-checking that whole run, not just the seams either
side of it — pulling the modules band out left stats and the leader's message
both white, and fixing that rippled through the two sections after them. The
check is done by reading every section's computed background in order, not by
eye.

**ಅಧ್ಯಕ್ಷರ ಮಾತು** portrait is a circular
medallion: a flag-gradient ring showing through the wrapper's own padding,
a white gap opened by the image's border, and a faint outer halo. Marked up as
`figure` / `blockquote` / `figcaption` so the attribution is real structure
rather than styled text. `assets/kanmada-ownr.png` is the 2.3 MB source;
`assets/talk-portrait.jpg` is a 115 KB square crop cut to put the eyes near
the upper third, rather than leaving the framing to `object-position`.

> The quote, the name and the designation in that section are **placeholders**.
> No statement there was made by anyone — replace them before this goes
> anywhere public.

**ನಮ್ಮ ಹೆಜ್ಜೆಗಳು** is a 3D coverflow of five campaign plates on the cream
ground: the front plate is upright and lit, the shoulders fan out, tip away on
`rotateY`, and recede by fading and desaturating — not darkening, which only
makes blots on a light background. The fourth rank drops out. Driven by the arrows, the dots,
click-to-front on a shoulder plate, arrow keys, and swipe. The plate art is one
shared SVG (`assets/hejje-plate.svg`) — flag banner, lit skyline, pennants.

## Accessibility

- Slider: real `<button>` controls, pause/play, arrow keys, `aria-current` on
  the page bars, an `aria-live` page announcement, autoplay suspended on hover,
  focus, and when the tab is hidden.
- `prefers-reduced-motion: reduce` disables autoplay and transitions entirely;
  no content depends on an animation having run.
- `forced-colors: active` restores the outlined headline and lesson numbers,
  which are otherwise drawn with `-webkit-text-stroke` on transparent text.
- Visible focus ring on every interactive element; whole-card link targets;
  labelled form field with an announced status message.
- Body text is at or above 4.5:1 throughout; captions over media carry their
  own scrim rather than relying on the artwork behind them.

## Notes

- To view: open `index.html` in any modern browser. Fonts come from Google
  Fonts; everything else is local, so it degrades to system serif/sans offline.
- `DESIGN-RECOMMENDATIONS.md` holds the full UI review this page was built from.
- Images carry `width`/`height` attributes for layout stability, and those are
  presentational hints mapped to CSS. Any rule that sets only `width` on such an
  image must also set `height: auto`, or the attribute's height stays in force
  and `aspect-ratio` never applies.
