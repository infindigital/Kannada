# Craft — ಸಿನಿಮ್ಯಾಟಿಕ್ ಕಥನ (Cinematic Storytelling)

A single-page course site in **Kannada (ಕನ್ನಡ)**: a **full-bleed video hero**
over a **light-theme** page in the Karnataka flag palette.

The hero is a **book-style slider**. Page one is the looping Karnataka flag
video; pages turn sideways over a shaded binding edge while the media inside
counter-slides, so they read as leaves of a book rather than one flat strip.
The chapter caption, page count and progress bars along the foot of the hero
track the current page.

## Files

- `index.html` — the whole page. No build step, no CDN, no framework: plain
  CSS custom properties and ~120 lines of vanilla JS.
- `assets/karnataka-flag.mp4` — looping Karnataka flag video, page 1 of the hero.
  Muted, autoplaying, `playsinline`, with a matching SVG poster so the hero is
  never blank while it loads.
- `assets/*.svg` — the page artwork (flag poster, Hampi colonnade, illuminated
  palace, viewfinder, film set, cinema hall). Vector, local, ~2–4 KB each, so
  the page renders complete with no network requests.

## Design system

| | |
|---|---|
| Surfaces | `#FDF6EC` cream · `#FFFFFF` · `#1A0800` deep (hero + one band) |
| Brand | `#C8102E` red · `#F5A623` yellow — the Karnataka flag |
| Display type | Instrument Serif → Noto Serif Kannada |
| Body type | Inter → Noto Sans Kannada |
| Radii | 2px controls · 6px cards · 14px the book |

Latin family is listed **first** in each stack: Noto's Kannada faces ship Latin
glyphs, so a Kannada-first stack would silently render all Latin text in them.

Everything is tokenised at the top of the `<style>` block — colors, radii,
shadows, easing, spacing and the type stacks — so the palette can be changed
in one place.

## Sections

Hero + book slider · stats · course modules (featured + grid) · themes ·
about (the one deep band) · enrolment · footer.

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
