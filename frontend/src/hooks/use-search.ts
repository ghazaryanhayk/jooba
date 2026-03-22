import { useQuery } from '@tanstack/react-query';

import type { FilterFormValues } from '@/components/search/filters/schema';
import { searchCandidates } from '@/lib/api';

export function useSearch(filters: FilterFormValues | null) {
  return useQuery({
    queryKey: ['search', filters],
    queryFn: () => searchCandidates(filters!),
    enabled: filters !== null,
  });
}
