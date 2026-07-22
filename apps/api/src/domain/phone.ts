export function normalizeE164(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().replace(/[\s().-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}
