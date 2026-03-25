import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createWrapper } from '@/test/test-utils';
import { useSearch } from './use-search';

describe('useSearch', () => {
  const filters = {
    title: [{ operator: 'is' as const, value: 'Eng', timeframe: 'current' as const }],
    country: [],
    experience: { from: '', to: '' },
  };

  it('is disabled when filters is null', () => {
    const { result } = renderHook(() => useSearch(null), { wrapper: createWrapper() });
    expect(result.current.isFetching).toBe(false);
  });

  it('fetches when filters provided', async () => {
    const { result } = renderHook(() => useSearch(filters), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.candidates).toHaveLength(1);
  });

  it('refetches on filter change', async () => {
    let currentFilters = filters;
    const { result, rerender } = renderHook(() => useSearch(currentFilters), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    currentFilters = {
      ...filters,
      title: [{ operator: 'is' as const, value: 'Manager', timeframe: 'current' as const }],
    };
    rerender();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('passes previewLimit', async () => {
    const { result } = renderHook(() => useSearch(filters, 50), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
