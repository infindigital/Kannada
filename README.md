# ŌURA — Our Ring 4 (Home Page)

A single-page product hero for the **Oura Ring 4**, rebuilt from the Figma
design. Self-contained HTML + CSS (no build step, no CSS framework at runtime).

## Files
- `index.html` — the home page. Hand-written CSS with Google Fonts
  (**Instrument Serif** for the display headline, **Inter** for UI/body).
  Sections: header (ŌURA wordmark, glass pill nav, "Order Now"), centered
  serif headline with the italic *personal*, the "OUR RING 4" badge, and a
  bottom bar (product name + price, centered "Order Now", description).
- `assets/` — media. Drop the hero product photo in as `assets/oura-hero.jpg`
  (see below).

## Hero image
The design's centerpiece is a photo of the ring resting in a field of pink
wildflowers under a blue sky. Until that image is added, the page shows a
matching **sky-to-field gradient** as a stand-in.

To use the real photo, save it as `assets/oura-hero.jpg` — `index.html`
already references it and layers it over the gradient. If the file is absent
the page falls back to the gradient automatically (via the image `onerror`
handler), so it never looks broken.

## Notes
- Fully responsive: below ~860px the pill nav collapses and the bottom bar
  stacks (CTA, price, description) in a centered column.
- To view: open `index.html` in any modern browser.
