import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole } from '@/lib/api';

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createRole(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
