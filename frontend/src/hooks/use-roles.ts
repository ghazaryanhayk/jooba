import { useQuery } from '@tanstack/react-query';

import { getRoles } from '@/lib/api';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
}
