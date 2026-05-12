// lib/editor/sky-variations.ts
export type SkyVariationId = 'clear-blue' | 'soft-cloudy' | 'dramatic' | 'sunset';

export const SKY_VARIATIONS: { id: SkyVariationId; label: string; blurb: string; promptFragment: string }[] = [
  {
    id: 'clear-blue',
    label: 'Clear Blue',
    blurb: 'Cloudless mid-blue sky, sharp sunlight.',
    promptFragment: 'Sky: cloudless mid-blue with a slight horizon haze. Clean, sharp sunlight.',
  },
  {
    id: 'soft-cloudy',
    label: 'Soft Cloudy',
    blurb: 'High wispy cirrus on pale blue — flattering, low contrast.',
    promptFragment: 'Sky: pale blue with wispy high cirrus clouds. Soft, even, flattering light without harsh shadows.',
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    blurb: 'Heavy cumulus, bright rim-lit highlights, magazine contrast.',
    promptFragment: 'Sky: dramatic cumulus cloud formations with bright rim-lit highlights, deep blue gaps, magazine-style contrast.',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    blurb: 'Warm horizon transitioning to soft pink and lavender.',
    promptFragment: 'Sky: warm orange sun low on the horizon, transitioning through soft pink and lavender to pale blue overhead. Golden hour glow on the building.',
  },
];

const SKY_BASE =
  'Replace ONLY the sky in this real-estate exterior photo. Preserve every building, landscape, plant, ' +
  'paving, and architectural detail exactly. Match the new sky light direction with realistic exterior ' +
  'shadows and warm/cool cast on the facade. No warped lines, no extra rooms, no surreal elements. ' +
  'Preserve original aspect ratio with no borders or letterboxing.';

export function buildSkyPrompt(id: SkyVariationId): string {
  const v = SKY_VARIATIONS.find(x => x.id === id);
  if (!v) throw new Error(`Unknown sky variation: ${id}`);
  return `${SKY_BASE} ${v.promptFragment}`;
}
