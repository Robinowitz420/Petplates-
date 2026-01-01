export const debugEnabled =
  process.env.NODE_ENV !== 'production' ||
  ['true', '1'].includes(String(process.env.NEXT_PUBLIC_ENABLE_DEBUG ?? '').toLowerCase());

export function debugLog(...args: any[]): void {
  if (!debugEnabled) return;
  console.log(...args);
}
