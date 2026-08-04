# UI/UX Design Review — Karnataka Video Hero + Namma Karnataka Blog

Scope: the repo's cinematic Kannada hero (`index.html`) and the uploaded
Figma Make design (`Video_hero_section_design.zip` → `src/App.tsx`,
`src/index.css`).

> **Status.** `index.html` has since been rebuilt against this review — light
> theme, flag palette, tokenised CSS, working book slider, and the P0/P1 fixes
> that applied to it. Its line references below therefore describe the
> pre-rebuild version and are kept for the record. The `App.tsx` findings are
> unchanged and still apply to the uploaded design.

Everything below is grouped by priority. **P0** items are functional
defects — they break layout, accessibility, or make content invisible.
**P1** items are accessibility and responsiveness gaps. **P2** is design
system and polish.

---

## 0. The headline problem: two designs, two identities

The two files describe different products with different visual languages:

| | Repo `index.html` | Uploaded design |
|---|---|---|
| Brand | "Craft", cinematic course | "Namma Karnataka", culture blog |
| Accent | `#FF7A00` orange | `#C8102E` red + `#F5A623` yellow (flag) |
| Type | Noto Serif/Sans Kannada + Instrument Serif | Playfair Display + Poppins |
| Language | Kannada throughout | English with a Kannada tag |
| Mood | Dark, editorial, high-contrast | Warm cream, magazine |

**Recommendation:** pick the Karnataka flag palette (`#C8102E` / `#F5A623`)
as the single brand identity — it is meaningful, distinctive, and already
carried through the uploaded design. Drop `#FF7A00`; a generic orange
next to a flag video reads as an accident rather than a choice. Then port
the dark cinematic hero *treatment* onto the flag palette so the hero and
the blog below it feel like one site.

A bilingual site also needs one typographic pair that works in **both**
scripts. Playfair Display has no Kannada coverage; Noto Serif Kannada has
no real Latin display personality. Recommended pairing:

- **Display:** `Instrument Serif` (Latin) + `Noto Serif Kannada` (Kannada)
- **Body:** `Inter` (Latin) + `Noto Sans Kannada` (Kannada)

…with the **Latin family listed first** in the stack (see P0-6).

---

## P0 — Functional defects

### P0-1 · Mobile nav renders twice (uploaded design)

`App.tsx:127` — the desktop nav has `className="hidden md:flex"` *and*
`style={{ display: 'flex' }}`. Inline styles beat stylesheet rules, so
`hidden` never applies: on a 375px screen the full desktop nav **and** the
hamburger both render, and the nav overflows the bar.

```diff
- <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden md:flex">
+ <div className="hidden md:flex items-center gap-8">
```

This is the general form of the bug: **inline styles cannot be
media-queried**, and they silently override utility classes. See P0-2.

### P0-2 · Two-column grids never collapse on mobile

`App.tsx:381` (featured post) and `App.tsx:690` (about section) hardcode
`gridTemplateColumns: '1fr 1fr'` inline. On a phone the featured post
becomes two ~180px columns — a 420px-tall image next to unreadable
40px-wide text. The about collage does the same.

Both need `grid-cols-1 md:grid-cols-2`, which means moving off inline
styles for anything layout-related.

### P0-3 · Hero content can be permanently invisible

`App.tsx:245,264,281,289` set `opacity: 0` inline and rely on the
`fadeInUp` animation to reveal it. If the animation never runs — CSS fails
to load, the element is created after the animation would have fired, or a
future `prefers-reduced-motion` rule disables it — the entire hero
headline, subhead and both CTAs stay invisible with no fallback.

Animate from a class, not an inline style, and always provide the
reduced-motion escape hatch:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up { animation: none; opacity: 1; transform: none; }
}
```

### P0-4 · Autoplaying video with no pause control

Both designs autoplay a looping background video. WCAG 2.2.2 requires a
mechanism to pause any motion that runs longer than 5 seconds. Neither has
one, and neither respects `prefers-reduced-motion`.

Minimum fix:

- A small pause/play toggle pinned to a hero corner (icon + `aria-label`).
- Under `prefers-reduced-motion: reduce`, don't autoplay — show the poster
  frame instead.
- `<video>` gets `aria-hidden="true"` and `tabindex="-1"` when purely
  decorative, plus a real `poster` attribute.

### P0-5 · The `<img>` inside `<video>` is not a fallback

`App.tsx:208` puts an `<img>` inside `<video>` expecting it to show if the
video fails. Browsers only render that fallback when `<video>` itself is
unsupported — which is essentially never today. A failed or blocked
network request gives you a black rectangle.

Use `poster="…"` on the video (also fixes the black flash before first
frame) *and* a CSS background image on the container.

### P0-6 · Font stacks silently disable the Latin display face

`index.html:18-19`:

```js
serif: ['"Noto Serif Kannada"', '"Instrument Serif"', 'serif'],
sans:  ['"Noto Sans Kannada"',  'Inter', 'sans-serif'],
```

Noto's Kannada families ship full Latin coverage, so the first font in the
stack always wins for Latin text too — `Instrument Serif` and `Inter` are
never used for anything. The "CRAFT" logotype is rendering in Noto Sans
Kannada's Latin, not Inter.

Put the Latin family first; the browser falls through to the Kannada font
for Kannada codepoints automatically:

```js
serif: ['"Instrument Serif"', '"Noto Serif Kannada"', 'serif'],
sans:  ['Inter', '"Noto Sans Kannada"', 'sans-serif'],
```

### P0-7 · The Kannada headline is broken mid-word

`index.html:136-137` splits **ಸಿನಿಮ್ಯಾಟಿಕ್** across two lines as
`ಸಿನಿಮ್ಯಾ-` / `ಟಿಕ್`. Kannada is not hyphenated this way — the break lands
inside the word and the trailing hyphen is a Latin convention that reads
as an error to a Kannada reader.

Additionally, `italic` is applied to `ಟಿಕ್` (`index.html:137`). Noto Serif
Kannada has no italic, so the browser synthesises a slanted version.
Faux-oblique Indic type distorts the conjuncts and is considered incorrect
typography.

**Fix:** use two complete words on two lines, no hyphen, no italic — e.g.
`ಸಿನಿಮ್ಯಾಟಿಕ್` / `ಕಥನ` ("cinematic storytelling"), with the second line
carrying the outline treatment instead of italics.

### P0-8 · Fixed 88px type overflows small screens

`index.html:136-137` uses `text-[88px]` on mobile inside `p-8` padding.
Kannada glyph clusters are wide; at 360px viewport the headline clips.
Replace with fluid type:

```html
<span class="block text-[clamp(2.75rem,11vw,9.375rem)]">
```

### P0-9 · The hero page cannot scroll

`index.html:95` sets `overflow-hidden` on `<body>` with `h-full`. On a
landscape phone (~380px tall) the header, headline, paragraph, CTA and
footer are all clipped with no way to reach them. Use `min-h-[100svh]` and
allow scrolling; reserve `overflow: hidden` for the video container only.

---

## P1 — Accessibility & interaction

### P1-1 · Nothing is keyboard reachable or focus-visible

Every interactive affordance in the uploaded design is hover-only:

- Nav links, buttons, cards and category tiles style themselves with
  `onMouseEnter`/`onMouseLeave` (`App.tsx:141, 161, 305, 610, 935`, etc.).
  Keyboard and touch users get **zero** state feedback.
- Post cards are `<article style={{ cursor: 'pointer' }}>` with no link and
  no click handler (`App.tsx:376, 448`) — they look clickable, aren't
  focusable, and do nothing.
- Category tiles are `<button>` elements with no handler
  (`App.tsx:595`).
- The repo hamburger is a `<div>` (`index.html:107`) — not focusable, no
  `aria-label`, no `aria-expanded`, and there's no menu behind it.

**Fixes:**

1. Move all hover styling into CSS `:hover, :focus-visible` pairs so both
   states are covered by construction.
2. Add a global focus ring:
   ```css
   :focus-visible { outline: 2px solid #F5A623; outline-offset: 3px; border-radius: 2px; }
   ```
3. Make the card title a real `<a>` and stretch it over the card
   (`.card a::after { content:''; position:absolute; inset:0 }`) — one
   focus stop, full-card click target, correct semantics.
4. Hamburger → `<button aria-label="Menu" aria-expanded="false"
   aria-controls="nav">` with a working panel, Escape-to-close and focus
   trap.

### P1-2 · Contrast failures

Measured against WCAG 2.1 AA (4.5:1 for text under 24px):

| Where | Colors | Ratio | Verdict |
|---|---|---|---|
| Card meta / dates (`App.tsx:435, 484, 631`) | `#9a7a5a` on `#fff` | **3.96:1** | ✗ fails |
| Hero subhead, scroll cue over video | white @ 50–82% over *video* | unbounded | ✗ unpredictable |
| `03 / 03` pagination (`index.html:156`) | `rgba(255,255,255,0.2)` stroke | ~1.4:1 | ✗ effectively invisible |
| Card body (`#7a5a3a` on `#fff`) | — | 6.3:1 | ✓ |
| Stat labels (white 50% on `#1A0800`) | — | 5.3:1 | ✓ |
| Category tags (all six) | — | 5.2–9.6:1 | ✓ |

Darken the meta color to `#7a5a3a` (already used elsewhere — one fewer
token, and it passes). For text over video, don't rely on the gradient
alone: add a localized scrim behind the text block (a soft radial or a
`backdrop-filter: blur(2px) brightness(0.6)` panel) so contrast holds no
matter which frame is showing.

### P1-3 · `-webkit-text-stroke` disappears in forced-colors mode

`index.html:33-46` renders the outline headline and the big numbers with
`color: transparent` + a stroke. In Windows High Contrast / forced-colors
mode the stroke is dropped and the text becomes genuinely invisible.

```css
@media (forced-colors: active) {
  .text-outline, .big-number-accent, .big-number-muted {
    color: CanvasText;
    -webkit-text-stroke: 0;
  }
}
```

Also note `-webkit-text-stroke` is unprefixed-unsupported; keep a
`paint-order: stroke fill` companion where you need the fill back.

### P1-4 · Language tagging

The uploaded design is an English page containing Kannada
(`ಕರ್ನಾಟಕ · Karnataka`, `App.tsx:250`; the decorative `ಕ` at
`App.tsx:683`). Screen readers will pronounce it with an English voice.
Wrap Kannada runs in `<span lang="kn">`, and mark the decorative `ಕ`
`aria-hidden="true"`.

### P1-5 · Form and status semantics

The newsletter (`App.tsx:900`) uses a placeholder as its only label, has
no error state, and swaps in a success message that a screen reader never
announces.

```jsx
<label className="sr-only" htmlFor="nl-email">Email address</label>
<input id="nl-email" type="email" autoComplete="email" … />
…
<div role="status" aria-live="polite">✓ You're in! …</div>
```

### P1-6 · Emoji as an icon system

`App.tsx:62-67` and `App.tsx:111` use emoji for category icons and the
logo. Three problems: they render differently on every OS (so the design
is not what you shipped), they are announced verbatim by screen readers
("classical building emoji"), and they undercut an otherwise editorial
look. Replace with a small inline SVG set — or better for these
categories, a duotone photo thumbnail per tile.

### P1-7 · Text truncation via `.slice(0, 100)`

`App.tsx:481` cuts the excerpt mid-word and would cut mid-grapheme in
Kannada (splitting a base character from its vowel sign). Use CSS:

```css
.excerpt { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
```

### P1-8 · Images cause layout shift

No `width`/`height` or `loading`/`decoding` attributes on any `<img>`
(`App.tsx:209, 391, 459, 773, 802`). Add intrinsic dimensions plus
`loading="lazy" decoding="async"` on everything below the fold; keep the
hero poster eager.

---

## P2 — Design system & polish

### P2-1 · Adopt tokens; stop writing inline styles

`index.css:4-12` already defines a perfectly good `@theme` block — and
then `App.tsx` ignores it entirely, hardcoding `#C8102E` **14 times**,
`#F5A623` **19 times**, and `#1A0800` **12 times**. Nothing can be
retheme d, dark-moded, or media-queried.

Proposed token set (extends what's already there):

```css
@theme {
  /* brand */
  --color-brand-red:      #C8102E;
  --color-brand-red-dark: #A50D24;   /* hover, already used ad hoc */
  --color-brand-yellow:   #F5A623;
  --color-brand-yellow-dk:#D4870D;

  /* surfaces */
  --color-surface:        #FFFFFF;
  --color-surface-sunken: #FDF6EC;
  --color-surface-inverse:#1A0800;
  --color-surface-deep:   #110400;

  /* text */
  --color-text:           #1A0800;
  --color-text-muted:     #5A3E2B;
  --color-text-subtle:    #7A5A3A;   /* AA-safe; replaces #9a7a5a */
  --color-border:         #F0E6D6;

  /* radii — currently 1/2/3/4px used interchangeably */
  --radius-sm: 2px;
  --radius-md: 6px;
  --radius-lg: 12px;

  /* elevation — currently 4 one-off shadows */
  --shadow-1: 0 1px 2px rgba(26,8,0,.06), 0 2px 8px rgba(26,8,0,.06);
  --shadow-2: 0 2px 4px rgba(26,8,0,.06), 0 12px 32px rgba(26,8,0,.10);
  --shadow-3: 0 8px 16px rgba(26,8,0,.08), 0 24px 56px rgba(200,16,46,.14);

  /* motion */
  --ease-out: cubic-bezier(.22,.61,.36,1);
  --dur-fast: 150ms;
  --dur-base: 250ms;
}
```

Radii today range across `1px, 2px, 3px, 4px, 50%` with no rule. Pick
**2px for tags/buttons, 6px for cards, full for avatars** and hold it.

### P2-2 · Type scale

There are 14 distinct font sizes across the two files, most of them
one-offs (`0.65, 0.7, 0.75, 0.8, 0.85, 0.875, 0.9, 0.95, 1, 1.15, 1.2,
1.3, 1.75, 2rem`). Collapse to a 7-step scale:

| Step | Size | Use |
|---|---|---|
| `display` | `clamp(2.5rem, 7vw, 5.5rem)` | Hero H1 |
| `h1` | `clamp(2rem, 4vw, 3rem)` | Section headline |
| `h2` | `1.75rem` | Featured post title |
| `h3` | `1.125rem` | Card title |
| `body` | `1rem / 1.7` | Paragraphs |
| `small` | `0.875rem` | Excerpts, nav |
| `micro` | `0.75rem / 0.1em tracking` | Tags, meta, eyebrows |

Two notes on the display face: Playfair Display italic is only loaded at
weights 400 and 600 (`index.css:1`), but `App.tsx:269` and `App.tsx:724`
render italic `<em>` inside a `font-weight: 900` heading — the browser is
faux-bolding it. Either load `1,900` or set those `<em>`s to 600. And add
`text-wrap: balance` to every headline; it fixes the one-word-orphan
problem these long titles will hit constantly.

### P2-3 · Hero composition

The uploaded hero is centered, symmetrical, and conventional. The repo
hero — left-aligned headline, right-rail slogan, footer meta — is far
stronger and much more "cinematic". Recommendation: keep the repo's
asymmetric layout, on the flag palette, with these adjustments:

- `100vh` → `100svh` (`index.css:51`). On mobile Safari, `100vh` includes
  the URL bar, so the scroll cue and the bottom of the hero sit below the
  fold at first paint.
- Move the scroll cue off pure opacity — a 1px gradient rule at 50%
  opacity over an unknown video frame is often invisible. Give it the same
  scrim as the text.
- The footer "progress bars" (`index.html:176-178`) and `00:01` timestamp
  imply a carousel that doesn't exist. Either build the slide behavior or
  remove them — decorative controls that don't respond are the most
  frustrating class of UI.

### P2-4 · Section rhythm

Vertical padding runs `80px → 72px → 96px → 80px → 48px` with no system.
Use a 4-step spacing scale (`24 / 48 / 80 / 120`) and give every major
section the same `clamp(4rem, 9vw, 7.5rem)` block padding so the page has
a steady pulse. Alternate `--color-surface` and `--color-surface-sunken`
to separate sections instead of relying on `border-top`.

### P2-5 · Category colors don't encode anything

`App.tsx:70-77` gives Heritage and Festivals the same red, and Travel and
Wildlife two greens 8% apart — so color carries almost no information but
adds six palette entries. Either commit to six genuinely distinguishable
hues, or (better for a flag-branded site) use **one** accent for all tags
and differentiate categories by icon and label alone.

### P2-6 · Performance

- The hero video is a 1080p `ForBiggerEscapes.mp4` from a public bucket
  (`App.tsx:204`) — several MB, blocking the LCP, and a third-party
  dependency in the critical path. Self-host, encode to ~1.5Mbps VP9/AV1
  with an H.264 fallback, cap at 720p, `preload="none"` on small screens,
  and serve a static poster only on `(max-width: 768px)` — a background
  video on cellular is a poor trade.
- `index.html:8` loads **Tailwind via CDN**, which ships a JIT compiler to
  the browser, flashes unstyled content, and is explicitly not for
  production. Move to a build step (the uploaded design already has Vite +
  Tailwind 4 configured — reuse it).
- Four font families × 3–6 weights is ~400KB before any content renders.
  Drop to two families, 3 weights each, `font-display: swap`, and
  `<link rel="preload">` only the display face used above the fold.
  Kannada Noto files are large — subset them if the page's Kannada content
  is a fixed set of strings.

### P2-7 · Smaller things

- `index.css:29-38` restyles the scrollbar to 6px solid red. It's
  webkit-only, harder to grab, and the red reads as an error state. Leave
  the scrollbar alone, or use `scrollbar-color` with a muted token.
- `index.html` has no `<meta name="description">`, no Open Graph tags, no
  favicon, no `theme-color`. For a page whose whole purpose is to be
  shared, the link preview matters as much as the hero.
- `html { scroll-behavior: smooth }` (`index.css:19`) should be gated on
  `prefers-reduced-motion: no-preference`.
- The Karnataka flag stripe (`App.tsx:226`) is a nice identity device —
  use it consistently as the section divider throughout instead of the
  generic `border-top: 1px solid #f0e6d6`.
- Add a dark mode. The palette is already 80% there (`#1A0800` surfaces,
  yellow accent); it needs `prefers-color-scheme` wiring on the tokens,
  which P2-1 makes trivial.

---

## Suggested order of work

1. **P0-1, P0-2, P0-3** — the layout and invisible-content bugs. Half a day.
2. **P2-1** — move to tokens and CSS classes. This is the enabling change:
   most P1 fixes are one-liners afterwards and impossible before.
3. **P1-1, P1-2** — focus states, real links, contrast. One day.
4. **P0-4, P0-7, P0-8, P0-9** — video controls and the Kannada typography.
5. **P2-6** — performance, then the remaining polish.
