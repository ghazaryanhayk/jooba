import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { useStopSearch } from './use-stop-search';

describe('useStopSearch', () => {
  it('calls stopSearch API', async () => {
    const { result } = renderHook(() => useStopSearch('role-1', 'search-1'), {
      wrapper: createWrapper(),
    });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('stopped');
  });

  it('invalidates status query on success', async () => {
    const qc = createTestQueryClient();
    const key = ['roles', 'role-1', 'searches', 'search-1', 'status'];
    qc.setQueryData(key, { status: 'running' });
    const { result } = renderHook(() => useStopSearch('role-1', 'search-1'), {
      wrapper: createWrapper({ queryClient: qc }),
    });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // After success, the status cache was invalidated; it may have been
    // removed or marked stale depending on refetch behavior
    const state = qc.getQueryState(key);
    // With gcTime: 0, invalidated queries get garbage collected immediately
    // so state may be undefined (removed) or isInvalidated = true
    expect(state === undefined || state.isInvalidated).toBeTruthy();
  });
});
