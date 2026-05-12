// lib/editor/dusk-variations.ts
export type DuskVariationId = 'golden-hour' | 'blue-hour' | 'late-twilight';

export const DUSK_VARIATIONS: { id: DuskVariationId; label: string; blurb: string; promptFragment: string }[] = [
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    blurb: 'Warm orange & pink horizon, sun just below the skyline.',
    promptFragment:
      'Sky: warm orange and soft pink at the horizon, gilded cirrus clouds, fading to pale lavender ' +
      'overhead. The sun has just set — residual warm light catches the building facade.',
  },
  {
    id: 'blue-hour',
    label: 'Blue Hour',
    blurb: 'Deep cobalt sky, dramatic interior-vs-exterior contrast.',
    promptFragment:
      'Sky: deep cobalt to indigo overhead, transitioning to a thin warm orange band on the horizon. ' +
      'Interior lights blaze warm against the cool sky — the classic real-estate twilight look.',
  },
  {
    id: 'late-twilight',
    label: 'Late Twilight',
    blurb: 'Near-dark sky, interior lights become the dominant light.',
    promptFragment:
      'Sky: near-dark indigo with the first stars faintly visible, a thin dark-purple horizon. ' +
      'Interior 2700K lamps dominate the scene with strong warm spill through every window.',
  },
];

const DUSK_BASE =
  'Convert the daytime real-estate photo to dusk/twilight. Every visible interior lamp, pendant, and ' +
  'downlight is switched ON at 2700-3000K. Landscape and path lights on. Shadows match the new low-angle ' +
  'light direction. Preserve architecture, geometry, composition, framing, and aspect ratio exactly.';

export function buildDuskPrompt(id: DuskVariationId): string {
  const v = DUSK_VARIATIONS.find(x => x.id === id);
  if (!v) throw new Error(`Unknown dusk variation: ${id}`);
  return `${DUSK_BASE} ${v.promptFragment}`;
}
