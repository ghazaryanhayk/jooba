import { useQuery } from '@tanstack/react-query';

import { getRoleCandidates } from '@/lib/api';

export function useRoleCandidates(roleId: string) {
  return useQuery({
    queryKey: ['roles', roleId, 'candidates'],
    queryFn: () => getRoleCandidates(roleId),
  });
}
