import { useQuery } from '@tanstack/react-query';

import { getSearchStatus } from '@/lib/api';

export function useSearchStatus(roleId: string, searchId: string | null) {
  return useQuery({
    queryKey: ['roles', roleId, 'searches', searchId, 'status'],
    queryFn: () => getSearchStatus(roleId, searchId!),
    enabled: searchId !== null,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 2000 : false),
  });
}
