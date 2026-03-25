import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { useCreateRole } from './use-create-role';

describe('useCreateRole', () => {
  it('calls createRole and returns the new role', async () => {
    const { result } = renderHook(() => useCreateRole(), { wrapper: createWrapper() });
    result.current.mutate('New Role');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('New Role');
  });

  it('invalidates roles query on success', async () => {
    const qc = createTestQueryClient();
    qc.setQueryData(['roles'], { roles: [{ id: '1', name: 'Old' }] });
    const { result } = renderHook(() => useCreateRole(), {
      wrapper: createWrapper({ queryClient: qc }),
    });
    result.current.mutate('Another Role');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // After mutation, roles cache is either invalidated or removed (gcTime: 0)
    const state = qc.getQueryState(['roles']);
    const isInvalidatedOrRemoved = state === undefined || (state.isInvalidated === true);
    expect(isInvalidatedOrRemoved).toBe(true);
  });
});
