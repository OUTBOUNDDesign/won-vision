// tests/fal-prompts.test.ts
import { describe, it, expect } from 'vitest';
import { buildPrompt } from '@/lib/fal/prompts';

describe('buildPrompt', () => {
  it('declutter prompt does not include style', () => {
    const p = buildPrompt('declutter');
    expect(p).toMatch(/remove all personal items/i);
    expect(p).not.toMatch(/scandinavian|coastal|mid-century/i);
  });

  it('stage prompt embeds the style fragment', () => {
    const p = buildPrompt('stage', 'scandinavian');
    expect(p).toMatch(/scandinavian/i);
    expect(p).toMatch(/photorealistic/i);
  });

  it('stage prompt defaults to modern when no style given', () => {
    const p = buildPrompt('stage');
    expect(p).toMatch(/modern/i);
  });

  it('dusk prompt converts day to twilight', () => {
    const p = buildPrompt('dusk');
    expect(p).toMatch(/twilight|dusk/i);
  });
});
