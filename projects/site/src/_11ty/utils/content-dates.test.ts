import { describe, expect, it } from 'vitest';
import { normalizeContentDate } from './content-dates.js';

describe('normalizeContentDate', () => {
  const date = '2026-07-22T12:00:00.000Z';

  it('should return null for invalid Date instances', () => {
    expect(normalizeContentDate(new Date('invalid'))).toBeNull();
  });

  it('should normalize valid Date instances', () => {
    expect(normalizeContentDate(new Date(date))).toBe(date);
  });

  it('should normalize valid date strings', () => {
    expect(normalizeContentDate(date)).toBe(date);
  });
});
