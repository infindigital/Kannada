# ಕನ್ನಡವೇ ನಮ್ಮ ಉಸಿರು — Kannada Culture Hero

A single-page cultural hero section celebrating **Kannada (ಕನ್ನಡ)** pride and
Karnataka identity, with a looping **Karnataka flag** video as the background.

## Design
- **Primary color:** `#c62828` (red) — CTA button, accents.
- **Secondary color:** `#ffd700` (gold) — headline emphasis, labels, logo mark.
- Colors mirror the yellow/red Karnataka flag.

## Copy
- **Headline:** ನಮ್ಮ ನಡೆ ಕನ್ನಡದೆಡೆ, / ಕನ್ನಡವೇ ನಮ್ಮ ಉಸಿರು
- **Sub-heading:** ಕರ್ನಾಟಕದ ಭವ್ಯ ಸಂಸ್ಕೃತಿ, ನೆಲ, ಜಲ ಮತ್ತು ಭಾಷೆಯ ಉಳಿವಿಗಾಗಿ
  ನಿರಂತರ ಹೋರಾಟ. ನಮ್ಮ ಅಸ್ಮಿತೆಯನ್ನು ಉಳಿಸಿ ಬೆಳೆಸಲು ನಮ್ಮೊಂದಿಗೆ ಕೈಜೋಡಿಸಿ.

## Files
- `index.html` — the hero page. Tailwind (CDN) + Google Fonts (Noto Serif/Sans
  Kannada for the Kannada type). The hero copy, nav, CTA and slogan are all in Kannada.
- `assets/karnataka-flag.mp4` — background video of the Karnataka flag
  (yellow/red bicolour) waving in the wind. Muted, autoplaying, looping. It sits
  under a dark gradient overlay so the foreground text stays legible.

## Notes
- The video is a full-bleed `<video autoplay muted loop playsinline>` behind a
  `.hero-overlay` darkening gradient.
- To view: open `index.html` in any modern browser.
