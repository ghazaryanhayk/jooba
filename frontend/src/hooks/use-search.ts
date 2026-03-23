import { useQuery } from '@tanstack/react-query';

import type { FilterFormValues } from '@/components/search/filters/schema';
import { searchCandidates } from '@/lib/api';

export function useSearch(filters: FilterFormValues | null, previewLimit = 25) {
  return useQuery({
    queryKey: ['search', filters, previewLimit],
    queryFn: () => searchCandidates(filters!, true, previewLimit),
    enabled: filters !== null,
  });
}
