// tests/workflow-helpers.test.ts
import { describe, it, expect } from 'vitest';
import { orderServices, batch } from '@/lib/workflow/helpers';

describe('orderServices', () => {
  it('returns declutter → stage → dusk regardless of input order', () => {
    expect(orderServices(['dusk', 'declutter', 'stage'])).toEqual(['declutter', 'stage', 'dusk']);
    expect(orderServices(['stage', 'declutter'])).toEqual(['declutter', 'stage']);
    expect(orderServices(['dusk'])).toEqual(['dusk']);
  });

  it('drops unknown services', () => {
    expect(orderServices(['stage', 'unknown' as any, 'declutter'])).toEqual(['declutter', 'stage']);
  });
});

describe('batch', () => {
  it('splits an array into chunks of given size', () => {
    expect(batch([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(batch([], 3)).toEqual([]);
  });
});
