# Craft — ಸಿನಿಮ್ಯಾಟಿಕ್ ಕೋರ್ಸ್ (Cinematic Course)

A single-page cinematic course hero, localized into **Kannada (ಕನ್ನಡ)**, with a
looping **Karnataka flag** video as the background.

## Files
- `index.html` — the hero page. Tailwind (CDN) + Google Fonts (Noto Serif/Sans
  Kannada for the Kannada type). The hero copy, nav, CTA and slogan are all in Kannada.
- `assets/karnataka-flag.mp4` — AI-generated background video of the Karnataka
  flag (yellow/red bicolour) waving in the wind. Muted, autoplaying, looping.
  It is lightly blurred and sits under a dark gradient overlay so the foreground
  text stays legible.

## Notes
- The video is a full-bleed `<video autoplay muted loop playsinline>` behind a
  `.hero-overlay` darkening gradient.
- To view: open `index.html` in any modern browser.
