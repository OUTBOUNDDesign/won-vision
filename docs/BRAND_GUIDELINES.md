# Won Vision — Brand Guidelines

**Real estate photography studio. Melbourne.**

This document is the human-readable guide to the Won Vision brand. It
covers the mark, palette, typography, photography style, voice, and
how to use them across web, social, print, and watermarks.

For the developer-facing version with code and implementation
specifics, see `BRAND.md` alongside this file.

---

## 1 · The idea

Won Vision is a Melbourne real-estate photography studio that lives
on craft, restraint, and seeing what other photographers miss.

The brand is **monochrome and quiet**. Black and white type, sharp
corners, uncomplicated layouts. The work — the photographs — are the
only place colour ever appears, and they're shown unedited and
full-saturation.

If a piece of design starts feeling busy, decorative, or "modern", it
isn't Won Vision.

---

## 2 · The mark

The Won Vision mark is a single graphic: a W and a V interlocked
through a shared centre stroke, with a circular dot in the top-right.

The triangular negative spaces inside the W and the V read as
aperture cuts — that's the connection to photography. Don't lose
them. The dot is the only round element in the entire brand; keep it
sharp and unaltered.

### Wordmark lockup

When the mark sits next to the words "Won Vision":

- The mark is on the **left**, words on the right.
- "Won Vision" is set in **sentence case** — never WON VISION.
- Set in Sora, weight 500.
- The mark height is roughly 1.4× the height of the letters.
- Leave a gap between mark and words equal to about 40% of the mark
  height.
- Vertically centre the mark with the height of the letters.

### Sizing

| Where it appears | Mark height |
|---|---|
| Hero image / about page | 80–120px |
| Website navigation | 32–40px |
| Footer | 24–32px |
| Browser favicon / app icon | 32px (mark only, no words) |
| Watermark on photos | 24–48px |
| Business card | 18–24mm |

### Clearspace

Always leave at least 25% of the mark's height as empty space on
every side. The dot needs room to breathe — the negative space
around it is part of the design.

### Mark — never

- Don't recolour outside black, white, and palette greys.
- Don't add a stroke or outline.
- Don't add drop shadow, glow, or gradient.
- Don't crop the dot.
- Don't separate the W from the V.
- Don't rotate or skew.
- Don't render "Won Vision" in all caps.

---

## 3 · Colour

Pure black and white. No accent colours.

| Token | Hex | Used for |
|---|---|---|
| Background | `#FFFFFF` | Default page background |
| Foreground | `#000000` | Headings, body, mark |
| Inverse background | `#000000` | Hero, drawer, lightbox |
| Inverse foreground | `#FFFFFF` | Text on dark sections |
| Secondary text | `#404040` | Sub-headings, body emphasis |
| Muted text | `#737373` | Captions, eyebrows, meta |
| Border light | `#E5E5E5` | Dividers on white |
| Border strong | `#999999` | High-contrast dividers |
| Border inverse | `#2A2A2A` | Dividers on black |

### Rules

- Default mode is **white background, black foreground**. Inverse
  (black/white) is reserved for high-impact moments — the hero, the
  navigation drawer, the lightbox.
- Photographs run in **full colour, unedited**. They're the only
  place hue exists in the brand. Don't apply a black-and-white
  filter, a tint, or a colour wash.
- No blue links, no green CTAs, no red errors. Hierarchy uses
  **weight, size, and grey value** — never hue.
- Don't pair grey on grey for primary content. Always use pure
  black on pure white (or pure white on pure black) for headings
  and body.

---

## 4 · Typography

The brand uses **one typeface**: Sora.

| Weight | Used for |
|---|---|
| **500** | Logo lockup, display, H1, H2, H3, eyebrows |
| **400** | Body copy, captions, labels |

There is no italic. Emphasis comes from weight, size, and uppercase
eyebrows.

### Type rules

- **Display headings and H1 are ALL CAPS.** They carry the brand's
  energy and match the geometry of the mark.
- **H2 and H3 are sentence case.** They guide reading without
  shouting.
- **Body copy is never uppercase.** Only eyebrows and small labels
  are.
- **The wordmark "Won Vision" is sentence case** — this is the one
  exception to the display all-caps rule. The mark is itself the
  identity glyph.
- **Letter-spacing**: tight on display (-0.03em), neutral on body,
  and wide on eyebrows (+0.2em).
- **Line-height**: tight on display (0.95), comfortable on body
  (1.5).

### Type scale (web)

| Level | Size | Notes |
|---|---|---|
| Display | 56–140px | Hero / brand statement, all caps |
| H1 | 40–80px | All caps |
| H2 | 28–48px | Sentence case |
| H3 | 20–28px | Sentence case |
| Body | 16px | Default reading size |
| Caption | 14px | Small print, image captions |
| Eyebrow | 11px | UPPERCASE, +0.2em tracking, used above headings |

### Voice in the type

- Confident, never loud.
- Precise short sentences. No filler.
- Plain English. No jargon. No real-estate clichés
  ("luxury living", "stunning views").
- "We" not "I". The studio speaks as a studio.

---

## 5 · Photography

The work is the brand's only colour. Treat it accordingly.

### Style guide

- **Naturally coloured.** No preset, no over-direction, no orange-
  and-teal.
- **Twilight on request only** — not a default look.
- Wide architectural shot + tight detail in the same pass.
- Aerial shots integrate with ground shots; don't deliver them as a
  separate aesthetic.
- Floor plans render in the brand's colours (black ink on white) —
  no rainbow keys, no real-estate-agency colour palettes.

### How to present photographs in the brand

- **Square corners only** — never round photo edges.
- **No filters or tints** in marketing surfaces.
- **No drop shadows.** Photos sit cleanly on the white background.
- **Full bleed where possible.** Cropping a great photo into a small
  card is a waste of it.
- Captions sit *below* or *over the bottom of* the image, never
  inside the frame.
- A dark gradient veil at the bottom of an image is okay if the
  caption sits over the photo (on the home services tiles, for
  example), but the veil is always neutral black, never tinted.

### Watermark

When watermarking deliverables, use the W+V mark only (no wordmark
text), at 24–48px in white or black depending on contrast. Place it
in the bottom-right corner with at least 24px clearspace.

---

## 6 · Layout language

### General principles

- **Sharp corners everywhere.** Border-radius never exceeds 4px.
- **No centred-everything layouts.** Default to left-aligned, with
  asymmetric breaks for emphasis. Centre title + centre subtext +
  centre CTA reads as a template.
- **Generous whitespace.** Sections breathe. The brand is restrained;
  layout pacing reflects that.
- **No emoji.** Use simple SVG icons that match the angular
  geometry of the mark.
- **No effects.** No glassmorphism, no gradients, no soft shadows,
  no neumorphism, no motion that calls attention to itself.

### Page rhythm (web home page)

1. Hero — full-bleed dark image with a subtle cursor lens; the
   navigation carries identity.
2. Services — numbered editorial list with a sticky photo pane.
3. Process — four-step horizontal stepper with an animated
   connecting rule.
4. Selected work — four-up listing grid.
5. Contact — full-bleed map showing the studio's 100km service
   radius.
6. Footer — clean four-column on white.

### Mobile

- Below 900px wide, the page is rebalanced for one-thumb use.
- Process moves above services on mobile (the explainer comes
  first).
- Services becomes a stack of full-width photo tiles, one per
  service.
- Process becomes four swipeable step-cards with a progress bar.
- Galleries collapse to single-column.

---

## 7 · Motion

Motion is used sparingly and always supports content, never
decorates.

### Brand-approved motion patterns

- **Mark draw-on.** The W and V outline traces, then the fill
  arrives, then the dot appears. Used in the loading screen and on
  hover of the navigation wordmark. ~3 seconds for the loading
  screen, ~1.6 seconds on hover.
- **Connecting rule reveal.** The line under the four-step process
  draws from left to right when scrolled into view; dots and copy
  stagger in behind it.
- **Photo crossfade.** When swapping between photos in the services
  pane or gallery lightbox, fade is 0.55 seconds, no slide, no
  scale.
- **Button slide.** Filled buttons lose their fill on hover (slides
  off to the right). Outline buttons gain a fill on hover (slides
  in from the left). Always horizontal, never vertical, always
  square corners.

### Never

- Bouncy or springy easing.
- Anything that exceeds two seconds for an interactive element.
- Auto-rotating carousels.
- Marquees or scrolling tickers.

---

## 8 · Voice and tone

### What Won Vision sounds like

- **Confident**, never loud.
- **Precise**, never vague.
- **Clear**, never clever.

### What Won Vision avoids

- Real-estate jargon ("nestled", "boasts", "stunning").
- Marketing superlatives ("the best", "the only", "the ultimate").
- Emoji in copy or UI.
- Hashtags in body copy. (Hashtags belong only in social posts and
  even there, sparingly.)

### Tagline

Lean. The brand doesn't need a tagline at the moment.
A descriptor like *"Real estate photography. Melbourne."* is fine
when context is needed.

---

## 9 · Brand-wide don'ts

- **No accent colours.** No blue links, no green CTAs, no red errors.
- **No other typefaces.** Sora only.
- **No effects on the logo or text.** No gradients, shadows, glows,
  or blurs.
- **No greyscale or filtered photos.** The work is in colour.
- **No rounded photo corners.** Square only.
- **No border-radius greater than 4px** anywhere.
- **No emoji** in any user interface.
- **No italic body type** — emphasis comes from weight.
- **No "WON VISION" in caps** — the wordmark is always sentence case.
- **No centred-template layouts.**

---

## 10 · Quick reference card

| | |
|---|---|
| Mark | W + V monogram + dot |
| Foreground | `#000000` |
| Background | `#FFFFFF` |
| Inverse | `#FFFFFF` on `#000000` |
| Type family | Sora |
| Heading & logo weight | **500** |
| Body weight | **400** |
| Display case | UPPERCASE |
| Heading case | Sentence case |
| Wordmark case | Sentence case (Won Vision) |
| Border radius | ≤ 4px |
| Photo corners | Square |
| Photo treatment | Full colour, unedited |
| Loading animation | ~3s, draws then holds |
| Mobile breakpoint | 900px |

---

*Won Vision Pty Ltd — brand guidelines, May 2026.*
