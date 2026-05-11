// lib/workflow/helpers.ts
import type { ServiceId } from '@/app/admin/editor/new/Intake';

const CANONICAL_ORDER: ServiceId[] = ['declutter', 'stage', 'dusk'];

export function orderServices(services: string[]): ServiceId[] {
  return CANONICAL_ORDER.filter((s) => services.includes(s));
}

export function batch<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
