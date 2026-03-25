import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createWrapper } from '@/test/test-utils';
import { useRoleCandidates } from './use-role-candidates';

describe('useRoleCandidates', () => {
  it('fetches when enabled', async () => {
    const { result } = renderHook(() => useRoleCandidates('role-1', true), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.candidates).toHaveLength(1);
  });

  it('is disabled when enabled=false', () => {
    const { result } = renderHook(() => useRoleCandidates('role-1', false), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });
});
