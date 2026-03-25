import { describe, expect, it } from 'vitest';
import { criteriaSchema, defaultCriteriaValues } from './criteria-schema';

describe('criteriaSchema', () => {
  it('accepts valid input', () => {
    const result = criteriaSchema.safeParse({
      general_intuition: 'find senior devs',
      must_haves: [{ value: 'Python' }],
      nice_to_haves: [{ value: 'React' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty values', () => {
    const result = criteriaSchema.safeParse({
      general_intuition: '',
      must_haves: [],
      nice_to_haves: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing general_intuition', () => {
    const result = criteriaSchema.safeParse({
      must_haves: [],
      nice_to_haves: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid item shape', () => {
    const result = criteriaSchema.safeParse({
      general_intuition: '',
      must_haves: ['plain string'],
      nice_to_haves: [],
    });
    expect(result.success).toBe(false);
  });

  it('defaultCriteriaValues conforms to schema', () => {
    const result = criteriaSchema.safeParse(defaultCriteriaValues);
    expect(result.success).toBe(true);
  });
});
