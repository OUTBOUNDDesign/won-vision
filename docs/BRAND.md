# Won Vision — Brand System v2

Real estate photography studio. Melbourne.
This brief is the canonical record of what is *actually shipped* on
wonvision.com.au — type, colour, mark, motion, components, mobile.
Use it for web (Next.js + vanilla CSS via CSS variables), social, print,
and watermarks.

> **Change log from v1**
> - Typography moved from Archivo + Archivo Black to a single Sora
>   variable family. Heading/logo weight is **500**, body weight is
>   **400**.
> - Locked the page rhythm: hero (cursor lens) → services (editorial
>   index) → process (animated stepper) → selected work → contact
>   map → footer.
> - Added the loading animation, hover-replay on the nav wordmark,
>   per-service gallery lightbox on /book, and full mobile patterns.

---

## 1. The mark

W+V monogram interlocked through a shared centre stroke, with a
circular dot top-right. The dot is the **only round element** —
everything else is angular.

The triangular negative spaces inside the W and V read as aperture
cuts; this is the mark's tie to photography. Don't lose them.

### Standalone assets shipped

- `public/won-vision-mark.svg` — `fill="currentColor"`, inherits
  surrounding text colour. Used inline.
- `app/icon.svg` — explicit `fill="#000"` favicon, served by Next.js
  file convention at `/icon.svg`.
- `app/components/WonVisionMark.tsx` — React component with
  `.wv-mark__path` (W + V) and `.wv-mark__dot` classes for animation.

```tsx
<WonVisionMark className="h-12 text-fg" />
```

### Mark + wordmark lockup

When the wordmark "Won Vision" appears next to the mark:

- **Sentence case** — *"Won Vision"*, never "WON VISION".
- Mark sits to the **left** of the wordmark.
- Vertically centred against wordmark cap height.
- Mark height ≈ 1.4× wordmark cap height (mark slightly taller than
  letterforms).
- Gap between mark and wordmark = 0.4× mark height.
- Set in **Sora 500**, letter-spacing -0.01em, line-height 1.

Implemented as `<Wordmark />` in `app/components/Wordmark.tsx`. The
`.wordmark` CSS class controls layout; the inner `.wordmark__mark` is
the SVG, `.wordmark__text` is "Won Vision".

### Sizing

| Context | Mark height |
|---|---|
| Hero / about page | 80–120px |
| Site nav | 32–40px |
| Footer | 24–32px |
| Favicon | 32px (mark only, no wordmark) |
| Watermark on photos | 24–48px |
| Business card | 18–24mm |

### Clearspace

Minimum clearspace = 25% of mark height on all sides. The dot needs
room to breathe — significant negative space around the mark is part
of the design.

### Mark don'ts

- Don't recolour outside black/white/palette greys.
- Don't add stroke or outline (except the loader/hover replay
  animations which use stroke deliberately).
- Don't apply effects (drop shadow, glow, gradient).
- Don't crop the dot off the mark.
- Don't separate the W from the V.
- Don't rotate or skew.
- Don't render the wordmark in ALL CAPS — sentence case only.

---

## 2. Colour

### System

Pure black-and-white binary. Utility greys for UI surfaces (borders,
secondary text). **No accent colours** — the brand is monochrome.
Photographs render in **full colour, unedited** — they are the only
hue on the page.

### CSS variables

```css
:root{
  /* Brand primaries */
  --bg:#FFFFFF;
  --fg:#000000;
  --bg-inverse:#000000;
  --fg-inverse:#FFFFFF;

  /* Text hierarchy on white */
  --text-primary:#000000;
  --text-secondary:#404040;
  --text-muted:#737373;

  /* Text hierarchy on black */
  --text-primary-inverse:#FFFFFF;
  --text-secondary-inverse:#B8B8B8;
  --text-muted-inverse:#8A8A8A;

  /* Surfaces */
  --border:#E5E5E5;
  --border-strong:#999999;
  --border-inverse:#2A2A2A;
}
```

### Rules

- Default mode: white background, black foreground.
- Inverse mode: black background, white foreground (hero, drawer,
  loader, lightbox).
- Photos sit unedited on either background — no overlay tint, no
  greyscale filter on production photos. (The earlier AC Media-style
  greyscale tile direction was retired in favour of full colour.)
- Veils on photo cards (services tiles, lightbox bars) only ever
  use rgba(0,0,0,…) — never tinted black.
- Don't introduce blue links, green CTAs, red errors. Hierarchy is
  achieved via weight and grey value, not hue.
- Don't pair grey on grey for primary content — always pure-on-pure.

---

## 3. Typography — Sora

One family across the brand. Loaded once via `next/font/google`.

| Use | Weight |
|---|---|
| Logo lockup, display, H1 | **500** |
| H2 | 500 |
| H3, eyebrow | 500 (eyebrows are tracked, smaller) |
| Body | 400 |
| Caption, label | 400 (with letter-spacing 0.22em, uppercase) |

There is no italic in the system; emphasis comes from weight, size,
and uppercase eyebrows.

### Loading

```ts
// app/fonts.ts
import { Sora } from 'next/font/google';

export const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sora',
  display: 'swap',
});
```

```tsx
// app/layout.tsx
<html className={sora.variable}>
```

CSS uses the variable through the `--display` and `--body` aliases —
both point at `var(--font-sora)`:

```css
:root{
  --display: var(--font-sora), system-ui, sans-serif;
  --body:    var(--font-sora), system-ui, -apple-system, sans-serif;
}
```

### Type scale

```css
/* Tailwind-style sizes (applied via CSS variables in globals.css) */
display:   clamp(56px, 9vw, 140px)   line 0.95   tracking -0.03em
h1:        clamp(40px, 6vw, 80px)    line 1      tracking -0.025em
h2:        clamp(28px, 4vw, 48px)    line 1.1    tracking -0.02em
h3:        clamp(20px, 2.5vw, 28px)  line 1.2    tracking -0.015em
body-lg:   clamp(18px, 1.5vw, 22px)  line 1.5
body:      16px                      line 1.55
caption:   14px                      line 1.4
eyebrow:   11px                      line 1.4    tracking 0.2em UPPER
```

### Type rules

- **Display + H1 are ALL CAPS** — heavy uppercase carries the brand,
  matches the monogram's energy.
- **H2 + H3 are sentence case** — readable hierarchy.
- **Body is never uppercase** — only eyebrows and labels.
- **The wordmark "Won Vision" is sentence case** — exception to the
  display all-caps rule because the mark is itself an identity glyph.
- **Letter-spacing**: tight on display (−0.03em), neutral on body,
  wide on eyebrow (0.2em).
- **Line height**: tight on display (0.95), comfortable on body
  (1.5–1.55).

---

## 4. Layout language

### Page rhythm — desktop

1. **Hero** — full-bleed dark image, cursor-lens reveal, no copy.
   The nav wordmark carries identity above the fold.
2. **Services** — editorial index. Numbered list left, sticky photo
   pane right. Hover swaps the photo. Section locked to 100vh.
3. **Process** — horizontal four-step stepper with an animated
   connecting rule that scales 0 → 1 from the left when scrolled
   into view; dots and copy stagger in behind it.
4. **Selected work** — 4-up grid linking to `/gallery`.
5. **Contact** — full-bleed map with 100km service radius overlay.
6. **Footer** — white background, B/W content, 4 columns.

### Page rhythm — mobile (≤900px)

The flex order swaps so process reads above services on phones.

1. Hero
2. **Process** (above services on phones) — horizontal scroll-snap
   cards, four bordered step-cards with a progress bar that lights
   the active segment.
3. **Services** — five stacked full-width photo tiles, aspect-ratio
   3:2, dark gradient veil, Sora 500 service name + arrow cue. Tap
   navigates to `/book#cat-…`.
4. Selected work, contact, footer — stacked.

### Spacing

- Section padding: `clamp(64px, 10vh, 120px)` vertical, gutter
  horizontal.
- Gutter: 32px desktop, 24px mobile, 18px small mobile.
- Max content width: 1480px, centred.

### Borders & radii

- **No border-radius > 4px anywhere.** Sharp corners match the
  mark's geometry.
- Photos render with `rounded-none` (square corners).
- Cards, tiles, the map container, the lightbox: all square-cornered.

---

## 5. Motion language

### Loading screen

Mark-only loader (`WonVisionLoader`). Default duration 3000ms.
Sequence:

1. Outline traces (stroke-dashoffset 1 → 0, 0–45%).
2. Fill fades in (fill-opacity 0 → 1, 45–65%) with the stroke still
   visible underneath.
3. Dot fades in (opacity 0 → 1, 60–73%) — *never scale at small
   sizes; it goes blurry*.
4. Hold the final logo (~720ms minimum at default duration).
5. Container fades and unmounts.

`prefers-reduced-motion` collapses the whole sequence.

### Nav wordmark replay

Hovering the nav wordmark replays the loader animation in ~1.6s — the
same `.wv-mark__path` and `.wv-mark__dot` classes drive both, so the
animated and resting states overlay pixel-perfect (they're literally
the same paths).

### Process stepper reveal

`IntersectionObserver` adds `.is-visible` when the section enters
viewport. The connecting rule scales 0 → 1 in 1.4s; each step's dot,
number, name, and description fade up in stagger (0.28s between
steps) so they appear to *land* as the rule passes their column.

### CTA hover

Two variants, both square corners, no radius:

- **Filled by default** (`.nav__cta`, `.loader__btn`) — black fill +
  white text at rest. On hover the fill slides off to the right
  revealing a black-bordered transparent button with black text.
- **Outline by default** (`.nav__cta--ghost`) — black border + black
  text at rest. On hover a black fill slides in from the left;
  text inverts to white.

The hero variant of the filled CTA inverts colours for the dark hero.

### Tile hover (services + work)

Photos scale 1.02 → 1.04 over ~1s ease, dark gradient veil softens
slightly. No filters ever swap (no greyscale on/off — photos stay
in colour).

---

## 6. Component patterns

### Editorial list (services on desktop)

- `<section class="services-editorial">` height locked to 100vh.
- Grid 1fr 1fr — list left, sticky pane right.
- Each row: 56px num column, 1fr name, auto meta. Padding clamps
  with viewport height so all five rows fit.
- Hover indents the row 16px and slides the name 8px right.
- Pane: black background, photos crossfade on row hover/focus.

### Stacked photo tiles (services on mobile)

- Five vertical full-width cards, aspect-ratio 3/2.
- Photo + dark gradient veil + Sora 500 name + arrow.
- Whole tile is the link; one tap navigates.

### Animated stepper (process on desktop)

- 4-col grid, single 1px rule across the top.
- 14px square dots sit *centred on the rule* (top:-31px).
- Stagger reveals on `.is-visible`.

### Scroll-snap cards (process on mobile)

- Horizontal flex strip, scroll-snap-type: x mandatory.
- Each card 78% width, bordered, padded.
- Progress bar of 4 segments under the row, segments fill black for
  the most-visible card (computed via getBoundingClientRect
  overlap).

### Per-service gallery lightbox (/book)

- `ServiceGalleryLightbox` mounted once at page root.
- Auto-injects a small "View" image button into every
  `.svc-card__media` (also watches mutations for late-mounted cards).
- Each button reads its category from the parent `.cat[data-gallery]`,
  with a per-card `data-gallery` override allowed.
- Click delegate runs in capture phase so the button always wins
  over the surrounding card's add-to-cart click.
- Lightbox: full-screen black, fixed title bar with caption + close,
  responsive photo grid, ESC closes, body scroll locked.

### Wordmark deep-links

The five services in the editorial index deep-link to `/book` anchors:
`#cat-photography`, `#cat-video`, `#cat-photography` (drone lives in
photography), `#cat-floorplans`, `#cat-staging`. `.cat` carries
`scroll-margin-top:96px` so headings clear the fixed nav after a hash
jump.

---

## 7. Implementation notes

- **Stack**: Next.js 16 App Router (Turbopack), React 19, vanilla CSS
  with CSS variables (no Tailwind in this project — variables and
  class-based styling). Static pages only.
- **Fonts**: `next/font/google` Sora, weights 400 + 500, swap
  display.
- **Images**: external Unsplash placeholders for now; replace with
  studio photos. Photos always full colour.
- **Analytics**: GA4 (`G-MHFPGW1T7F`) loaded via afterInteractive
  Script in root layout. OUTBOUND ops pixel via
  `track.js?slug=won-vision` on the home page.
- **Booking pixel**: `booking-submit.js` from
  `ops.outbounddesign.com.au` on the confirmation page.

### Folder map

```
app/
  page.tsx                 # home — hero, services, process, work, contact
  layout.tsx               # html shell + Sora + scripts
  fonts.ts                 # next/font Sora
  globals.css              # all CSS — legacy + Brand v1 + section overrides
  icon.svg                 # favicon (file-convention served at /icon.svg)
  components/
    Wordmark.tsx           # mark + "Won Vision" lockup
    WonVisionMark.tsx      # SVG (W, V, dot) with animation hooks
    LoaderGate.tsx         # mounts the loader only on first session visit
    WonVisionLoader.tsx    # outline → fill → dot animation
    ServicesEditorial.tsx  # services list + sticky pane + mobile tiles
    ProcessStepper.tsx     # animated rule stepper + mobile scroll-snap
    ServiceGalleryLightbox.tsx  # /book per-service lightbox
  book/                    # /book and child checkout/schedule/confirmation
  gallery/                 # /gallery
public/
  won-vision-mark.svg      # standalone mark for non-React contexts
  script.js                # legacy nav + reveal observers
```

---

## 8. Brand-wide don'ts

- **No accent colours** — no blue links, green CTAs, red errors.
  Hierarchy uses weight, size, and grey value.
- **No other typefaces** — Sora only.
- **No effects on logo or text** — no gradients, shadows, glows,
  blurs (the loader's stroke trace is the only deliberate stroke
  treatment).
- **No centred-everything layouts** — left-aligned by default, with
  asymmetric breaks. Centred hero + centred subtext + centred CTA =
  template energy.
- **No greyscale photos** — the brand is monochrome in *type and
  surfaces*, not in *photography*.
- **No rounded photos** — square corners only.
- **No border radius > 4px** anywhere.
- **No emoji** in UI. Use inline SVG icons sourced to match the
  angular geometry.
- **No italic body type** — emphasis via weight, not style.
- **No "WON VISION" in caps for the wordmark** — sentence case
  always. (Other display headings still go uppercase.)

---

## Quick reference

| | |
|---|---|
| Brand mark | W+V monogram + dot |
| Foreground | `#000000` |
| Background | `#FFFFFF` |
| Inverse | `#FFFFFF` on `#000000` |
| Type family | Sora |
| Heading / logo weight | **500** |
| Body weight | **400** |
| Display case | UPPERCASE |
| Heading case | Sentence case |
| Wordmark case | Sentence case ("Won Vision") |
| Border radius | ≤ 4px |
| Photo corners | Square |
| Photo treatment | Full colour, unedited |
| Loader duration | 3000ms (default) |
| Mobile breakpoint | 900px |
