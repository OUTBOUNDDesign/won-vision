// lib/dropbox/paths.ts
const ROOT = '/Virtual Editing';

export function slugifyAddress(address: string): string {
  return address
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildIntakePath(address: string) {
  return `${ROOT}/00 INTAKE/${slugifyAddress(address)}`;
}
export function buildProcessingPath(address: string) {
  return `${ROOT}/01 AI PROCESSING/${slugifyAddress(address)}`;
}
export function buildReviewPath(address: string) {
  return `${ROOT}/02 EDITOR REVIEW/${slugifyAddress(address)}`;
}
