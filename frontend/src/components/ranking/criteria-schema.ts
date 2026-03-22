import { z } from 'zod';

const criteriaItemSchema = z.object({ value: z.string() });

export const criteriaSchema = z.object({
  general_intuition: z.string(),
  must_haves: z.array(criteriaItemSchema),
  nice_to_haves: z.array(criteriaItemSchema),
});

export type CriteriaFormValues = z.infer<typeof criteriaSchema>;

export const defaultCriteriaValues: CriteriaFormValues = {
  general_intuition: '',
  must_haves: [{ value: '' }],
  nice_to_haves: [{ value: '' }],
};
