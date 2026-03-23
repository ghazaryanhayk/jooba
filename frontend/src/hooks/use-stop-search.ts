import { useMutation, useQueryClient } from '@tanstack/react-query';

import { stopSearch } from '@/lib/api';

export function useStopSearch(roleId: string, searchId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => stopSearch(roleId, searchId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['roles', roleId, 'searches', searchId, 'status'],
      });
    },
  });
}
