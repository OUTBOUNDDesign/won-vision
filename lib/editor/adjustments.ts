// lib/editor/adjustments.ts
import { z } from 'zod';

const slider = (label: string) => z.number().min(-100).max(100).default(0).describe(label);

export const adjustmentsSchema = z.object({
  exposure:    slider('Exposure'),
  contrast:    slider('Contrast'),
  temperature: slider('Temperature'),
  tint:        slider('Tint'),
  saturation:  slider('Saturation'),
  highlights:  slider('Highlights'),
  shadows:     slider('Shadows'),
  whites:      slider('Whites'),
  blacks:      slider('Blacks'),
  sharpening:  slider('Sharpening'),
  clarity:     slider('Clarity'),
  dehaze:      slider('Dehaze'),
});

export type Adjustments = z.infer<typeof adjustmentsSchema>;

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  exposure: 0, contrast: 0, temperature: 0, tint: 0,
  saturation: 0, highlights: 0, shadows: 0, whites: 0,
  blacks: 0, sharpening: 0, clarity: 0, dehaze: 0,
};

export const SLIDER_KEYS: (keyof Adjustments)[] = [
  'exposure', 'contrast', 'temperature', 'tint',
  'highlights', 'shadows', 'whites', 'blacks',
  'saturation', 'clarity', 'dehaze', 'sharpening',
];
