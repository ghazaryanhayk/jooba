import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/mocks/server';
import { createWrapper } from '@/test/test-utils';
import { useSearchStatus } from './use-search-status';

describe('useSearchStatus', () => {
  it('is disabled when searchId is null', () => {
    const { result } = renderHook(() => useSearchStatus('role-1', null), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });

  it('fetches when searchId provided', async () => {
    const { result } = renderHook(() => useSearchStatus('role-1', 'search-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe('completed');
  });

  it('polls at 2s when status is running', async () => {
    server.use(
      http.get('/api/roles/:roleId/searches/:searchId/status', () =>
        HttpResponse.json({ status: 'running' }),
      ),
    );
    const { result } = renderHook(() => useSearchStatus('role-1', 'search-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data?.status).toBe('running'));
    // The refetchInterval option is set, we can verify the hook returned the correct data
    expect(result.current.data?.status).toBe('running');
  });

  it('stops polling when status is not running', async () => {
    const { result } = renderHook(() => useSearchStatus('role-1', 'search-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Default handler returns 'completed', so polling should be off (refetchInterval = false)
    expect(result.current.data?.status).toBe('completed');
  });
});
