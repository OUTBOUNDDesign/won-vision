// lib/fal/prompts.ts
import type { ServiceId } from '@/app/admin/editor/new/Intake';

/* ─────────────────────────────────────────────────────────────────────────
   BASE REALISM
   Applied to every prompt. Locks photoreal output + 4K + architectural fidelity.
   ─────────────────────────────────────────────────────────────────────── */
const BASE_REALISM =
  'Photorealistic professional real-estate interior photograph. Shot on a full-frame ' +
  'DSLR with a 17-35mm wide lens, f/8, daylight-balanced. Preserve the original ' +
  'architecture, windows, fixtures, flooring, ceiling, wall geometry, perspective, and ' +
  'lens exactly. Sharp focus throughout, no warped lines, no extra rooms, no impossible ' +
  'reflections, no surreal elements, no text or watermarks. Output at 4096px long edge.';

/* ─────────────────────────────────────────────────────────────────────────
   STYLE-SPECIFIC STAGING PROMPTS
   One full, dedicated prompt per furniture style — not a fragment.
   Each describes: palette, furniture pieces, materials, accents, lighting.
   ─────────────────────────────────────────────────────────────────────── */
const STAGE_PROMPTS: Record<string, string> = {
  modern: [
    'Stage the room in CONTEMPORARY MODERN style.',
    'Palette: warm white walls, soft greige textiles, charcoal accents, brushed nickel.',
    'Furniture: low-profile sofa in oatmeal bouclé or grey performance fabric; sculptural',
    'mid-tone oak coffee table with rounded edges; matte black floor lamp with linen shade;',
    'minimalist ceramic vases; a single abstract canvas in muted tones above the sofa.',
    'Rug: low-pile flatweave in cream with subtle texture, sized to anchor the seating.',
    'Decor is restrained and intentional — no clutter, no maximalism. Lighting is soft,',
    'diffused daylight from existing windows, optional warm 2700K floor lamp glow.',
  ].join(' '),

  scandinavian: [
    'Stage the room in SCANDINAVIAN style.',
    'Palette: bright soft whites, warm pale beige, cool dove grey, blonde wood, hints of',
    'sage and dusty blue. Furniture: pale ash or birch dining/coffee table with tapered',
    'legs; cream linen sofa with crisp piping; sheepskin throw draped over an accent chair;',
    'simple white ceramic pendant; woven jute rug; potted fig or olive plant in matte terracotta.',
    'Decor accents: thin black-framed graphic print, hand-thrown stoneware mugs, a candle on',
    'the coffee table. Hygge mood — uncluttered, warm, inviting. Lighting is bright, sheer,',
    'cool daylight through unadorned windows.',
  ].join(' '),

  coastal: [
    'Stage the room in COASTAL HAMPTONS style.',
    'Palette: crisp whites, sandy beige, soft seafoam and pale denim blue, weathered driftwood.',
    'Furniture: slipcovered linen sofa in white or pale blue; whitewashed timber coffee table;',
    'rattan armchair with cream cushion; rope-detail floor lamp; large round mirror with',
    'distressed timber frame. Textiles: striped linen cushions, chunky cable-knit throw, a',
    'natural fibre jute or sisal rug. Accents: ceramic vase with sea-grass or eucalyptus, glass',
    'hurricane lantern, a stack of art-photography books with ocean themes. Lighting: bright,',
    'airy, sun-bleached daylight through gauze curtains.',
  ].join(' '),

  'mid-century': [
    'Stage the room in MID-CENTURY MODERN style.',
    'Palette: warm walnut, tan leather, mustard or burnt-orange accents, deep teal, brass.',
    'Furniture: walnut sofa with tapered peg legs and tan leather cushions; walnut sideboard',
    'with sliding doors and brass pulls; sculptural arc floor lamp in brass; ceramic table',
    'lamp in mustard or olive. Decor: abstract framed print in earth tones, a brass bar cart',
    'with vintage glassware, geometric tribal-pattern rug in rust and cream. Plants: a tall',
    'monstera or fiddle-leaf fig in a tapered planter on hairpin legs. Lighting: warm',
    'tungsten-tone evening glow OR sharp afternoon daylight that highlights wood grain.',
  ].join(' '),
};

/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC API
   ─────────────────────────────────────────────────────────────────────── */
export function buildPrompt(service: ServiceId, style?: string): string {
  if (service === 'declutter') {
    return [
      BASE_REALISM,
      'Task: DECLUTTER. Remove all personal items, paperwork, photo frames, magazines,',
      'cables, charging stations, kitchen clutter, toiletries, rubbish bins, laundry,',
      'and any temporary or visually noisy items. Remove portable furniture only if it',
      'is clearly excess (extra chairs blocking flow, mismatched storage). PRESERVE all',
      'built-in fixtures: kitchen cabinetry, range, fireplaces, built-in shelving and',
      'wardrobes, doors, windows, light fittings, flooring. Keep the natural lighting,',
      'shadows, and white balance of the original image unchanged. The result should',
      'look like the same room professionally tidied for a listing, not staged.',
    ].join(' ');
  }

  if (service === 'stage') {
    const styleKey = style && STAGE_PROMPTS[style] ? style : 'modern';
    return [
      BASE_REALISM,
      'Task: VIRTUAL STAGING.',
      STAGE_PROMPTS[styleKey],
      'CRITICAL: all furniture must sit flat on the original floor with physically correct',
      'shadows and contact points. Scale must match the room. Do NOT alter walls, ceilings,',
      'windows, doors, fixtures, or flooring. No floating objects, no clipping, no warped',
      'edges. The result must be indistinguishable from a real photograph of a staged room.',
    ].join(' ');
  }

  // dusk
  return [
    BASE_REALISM,
    'Task: DAY-TO-DUSK CONVERSION. Convert the lighting from daytime to dusk/twilight.',
    'Sky: gradient from warm sunset orange and soft pink at the horizon to deepening',
    'cobalt blue overhead, with a few faint cirrus clouds. Sun has just set. Interior',
    'lighting: all visible lamps, pendants, and downlights warmly illuminated at 2700K,',
    'glowing through windows where applicable, creating soft pools of warm light on',
    'interior surfaces. Exterior: subtle warm ambient glow on the building facade where',
    'natural light would still hit; landscape lights on if visible. Reflections and',
    'shadows must match the new low-angle light direction. Preserve all architecture,',
    'composition, and framing exactly as the original.',
  ].join(' ');
}
