import { useQuery } from '@tanstack/react-query';
import { getRoleFilters } from '@/lib/api';

export function useRoleFilters(roleId: string) {
  return useQuery({
    queryKey: ['role-filters', roleId],
    queryFn: () => getRoleFilters(roleId),
  });
}
