import { z } from 'zod';

export const titleRowSchema = z.object({
  operator: z.enum(['is', 'is_not', 'fuzzy', 'substring']),
  value: z.string(),
  timeframe: z.enum(['current', 'ever', 'past']),
});

export const countryRowSchema = z.object({
  operator: z.enum(['is', 'is_not']),
  value: z.string(),
});

export const filterSchema = z.object({
  title: z.array(titleRowSchema),
  country: z.array(countryRowSchema),
  experience: z.object({
    from: z.string(),
    to: z.string(),
  }),
});

export type TitleRow = z.infer<typeof titleRowSchema>;
export type CountryRow = z.infer<typeof countryRowSchema>;
export type FilterFormValues = z.infer<typeof filterSchema>;

export const defaultFilterValues: FilterFormValues = {
  title: [{ operator: 'is', value: '', timeframe: 'current' }],
  country: [{ operator: 'is', value: '' }],
  experience: { from: '', to: '' },
};
