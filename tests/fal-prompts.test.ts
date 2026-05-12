// tests/fal-prompts.test.ts
import { describe, it, expect } from 'vitest';
import { buildPrompt } from '@/lib/fal/prompts';

describe('buildPrompt', () => {
  it('declutter prompt does not include staging style', () => {
    const p = buildPrompt({ type: 'declutter' });
    expect(p).toMatch(/remove every removable personal item/i);
    expect(p).not.toMatch(/scandinavian|coastal|mid-century/i);
  });

  it('stage prompt embeds the style fragment', () => {
    const p = buildPrompt({ type: 'stage', style: 'scandinavian' });
    expect(p).toMatch(/scandinavian/i);
    expect(p).toMatch(/photorealistic/i);
  });

  it('stage prompt with modern style includes modern content', () => {
    const p = buildPrompt({ type: 'stage', style: 'modern' });
    expect(p).toMatch(/modern/i);
  });

  it('dusk prompt converts day to twilight', () => {
    const p = buildPrompt({ type: 'dusk', variation: 'blue-hour' });
    expect(p).toMatch(/twilight|dusk/i);
    expect(p).toMatch(/cobalt/i);
  });

  it('sky prompt includes sky replacement task', () => {
    const p = buildPrompt({ type: 'sky', variation: 'clear-blue' });
    expect(p).toMatch(/sky replacement/i);
    expect(p).toMatch(/cloudless/i);
  });

  it('lawn prompt includes lawn enhancement task', () => {
    const p = buildPrompt({ type: 'lawn' });
    expect(p).toMatch(/lawn enhancement/i);
  });

  it('fire prompt includes fire on task', () => {
    const p = buildPrompt({ type: 'fire' });
    expect(p).toMatch(/fire on/i);
  });

  it('ceiling prompt includes ceiling brighten task', () => {
    const p = buildPrompt({ type: 'ceiling' });
    expect(p).toMatch(/ceiling brighten/i);
  });

  it('object-removal prompt includes the mask hint', () => {
    const p = buildPrompt({ type: 'object-removal', maskHint: 'the red bin in the corner' });
    expect(p).toMatch(/object removal/i);
    expect(p).toMatch(/the red bin in the corner/);
  });

  it('stage prompt includes industrial-loft content', () => {
    const p = buildPrompt({ type: 'stage', style: 'industrial-loft' });
    expect(p).toMatch(/industrial loft/i);
    expect(p).toMatch(/cognac|leather/i);
  });

  it('stage prompt includes japandi content', () => {
    const p = buildPrompt({ type: 'stage', style: 'japandi' });
    expect(p).toMatch(/japandi/i);
    expect(p).toMatch(/ivory|sage/i);
  });
});
