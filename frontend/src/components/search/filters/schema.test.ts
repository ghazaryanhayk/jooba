import { describe, expect, it } from 'vitest';
import { defaultFilterValues, filterSchema, suggestedFilters } from './schema';

describe('filterSchema', () => {
  it('accepts valid input', () => {
    const result = filterSchema.safeParse({
      title: [{ operator: 'is', value: 'Engineer', timeframe: 'current' }],
      country: [{ operator: 'is', value: 'US' }],
      experience: { from: '2', to: '10' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid title operator', () => {
    const result = filterSchema.safeParse({
      title: [{ operator: 'invalid', value: 'Eng', timeframe: 'current' }],
      country: [],
      experience: { from: '', to: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid timeframe', () => {
    const result = filterSchema.safeParse({
      title: [{ operator: 'is', value: 'Eng', timeframe: 'future' }],
      country: [],
      experience: { from: '', to: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid country operator', () => {
    const result = filterSchema.safeParse({
      title: [],
      country: [{ operator: 'fuzzy', value: 'US' }],
      experience: { from: '', to: '' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty arrays', () => {
    const result = filterSchema.safeParse({
      title: [],
      country: [],
      experience: { from: '', to: '' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts all valid title operators', () => {
    for (const op of ['is', 'is_not', 'fuzzy', 'substring']) {
      const result = filterSchema.safeParse({
        title: [{ operator: op, value: 'test', timeframe: 'current' }],
        country: [],
        experience: { from: '', to: '' },
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid timeframes', () => {
    for (const tf of ['current', 'ever', 'past']) {
      const result = filterSchema.safeParse({
        title: [{ operator: 'is', value: 'test', timeframe: tf }],
        country: [],
        experience: { from: '', to: '' },
      });
      expect(result.success).toBe(true);
    }
  });

  it('defaultFilterValues conforms to schema', () => {
    const result = filterSchema.safeParse(defaultFilterValues);
    expect(result.success).toBe(true);
  });

  it('suggestedFilters conforms to schema', () => {
    const result = filterSchema.safeParse(suggestedFilters);
    expect(result.success).toBe(true);
  });
});
