import { useMutation } from '@tanstack/react-query';

import type { FilterFormValues } from '@/components/search/filters/schema';
import { runFullSearch } from '@/lib/api';

export function useRunFullSearch(roleId: string) {
  return useMutation({
    mutationFn: (filters: FilterFormValues) => runFullSearch(roleId, filters),
  });
}
