import { describe, expect, it } from 'vitest';
import { normalizeE164 } from '../src/domain/phone.js';

describe('normalisation E.164', () => {
  it('normalise un numéro international vérifié', () => {
    expect(normalizeE164('+237 6 99 00 11 22')).toBe('+237699001122');
  });

  it('refuse un numéro local ambigu', () => {
    expect(normalizeE164('699001122')).toBeNull();
  });
});
