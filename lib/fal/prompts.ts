// lib/fal/prompts.ts
import type { ServiceId } from '@/app/admin/editor/new/Intake';

const STYLE_FRAGMENTS: Record<string, string> = {
  modern: 'clean lines, neutral palette, minimal clutter, contemporary furniture, soft natural light',
  scandinavian: 'warm pale wood, soft whites and beige tones, cozy textures, hygge accents, sheer natural light',
  coastal: 'light blues and sandy tones, breezy linen textiles, weathered wood, airy bright daylight',
  'mid-century': 'walnut and tan leather, geometric accents, brass details, warm tungsten light',
};

const BASE_REALISM =
  'Photorealistic real-estate interior photograph. Preserve original architecture, windows, fixtures, ' +
  'flooring, ceiling, and wall geometry exactly. Maintain perspective and lens. No warped lines, ' +
  'no extra rooms, no surreal elements. Output at 4096px long edge.';

export function buildPrompt(service: ServiceId, style?: string): string {
  if (service === 'declutter') {
    return `${BASE_REALISM} Remove all personal items, clutter, excess furniture, photographs, ` +
      `magazines, cables, and visual noise. Leave the room empty of decor while preserving large ` +
      `built-in fixtures (kitchen cabinetry, fireplaces, built-in shelving). Keep natural lighting.`;
  }
  if (service === 'stage') {
    const styleKey = style && STYLE_FRAGMENTS[style] ? style : 'modern';
    return `${BASE_REALISM} Add tasteful furniture and decor in ${styleKey} style: ${STYLE_FRAGMENTS[styleKey]}. ` +
      `Furniture must sit correctly on the floor with realistic shadows. Do not alter walls, windows, or fixtures.`;
  }
  // dusk
  return `${BASE_REALISM} Convert the lighting from daytime to dusk/twilight. Sky transitions to warm ` +
    `sunset orange and deepening blue. Interior artificial lights warm and on, visible through windows. ` +
    `Subtle warm ambient glow on the building exterior. Preserve all architecture and composition.`;
}
