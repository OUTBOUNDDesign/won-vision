// lib/editor/presets.ts
import type { Adjustments } from './adjustments';
import { DEFAULT_ADJUSTMENTS } from './adjustments';

export type HdrPreset = {
  id: 'standard' | 'natural' | 'warm' | 'cool' | 'bright-airy' | 'moody';
  label: string;
  blurb: string;
  adjustments: Adjustments;
};

export const HDR_PRESETS: HdrPreset[] = [
  {
    id: 'standard',
    label: 'Standard',
    blurb: 'MLS-safe neutral. True colour, balanced contrast.',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
  },
  {
    id: 'natural',
    label: 'Natural',
    blurb: 'Lifelike, slightly desaturated, soft contrast.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, saturation: -8, contrast: -5, clarity: -5, sharpening: 8 },
  },
  {
    id: 'warm',
    label: 'Warm',
    blurb: 'Golden white balance, inviting, lifted shadows.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: 12, shadows: 10, highlights: -8, saturation: 6 },
  },
  {
    id: 'cool',
    label: 'Cool',
    blurb: 'Slight blue cast, crisp shadows, contemporary feel.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, temperature: -10, tint: -3, contrast: 8, whites: 4 },
  },
  {
    id: 'bright-airy',
    label: 'Bright & Airy',
    blurb: 'High-key, walls pushed to white, lifted shadows.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, exposure: 12, shadows: 20, whites: 14, contrast: -8, clarity: -8 },
  },
  {
    id: 'moody',
    label: 'Moody',
    blurb: 'Deeper contrast, rich shadows, magazine drama.',
    adjustments: { ...DEFAULT_ADJUSTMENTS, contrast: 18, blacks: -14, shadows: -10, clarity: 10, saturation: -4 },
  },
];

export function getPreset(id: string): HdrPreset | undefined {
  return HDR_PRESETS.find(p => p.id === id);
}
