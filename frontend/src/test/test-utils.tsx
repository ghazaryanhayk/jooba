import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { SearchStatusContext, type SearchStatusContextValue } from '@/contexts/search-status-context';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  queryClient?: QueryClient;
  searchStatus?: SearchStatusContextValue;
}

export function createWrapper(opts: WrapperOptions = {}) {
  const queryClient = opts.queryClient ?? createTestQueryClient();
  const searchStatus: SearchStatusContextValue = opts.searchStatus ?? {
    searchStatus: null,
    setSearchStatus: () => {},
  };

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SearchStatusContext.Provider value={searchStatus}>
          {children}
        </SearchStatusContext.Provider>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  opts: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { queryClient, searchStatus, ...renderOpts } = opts;
  return render(ui, {
    wrapper: createWrapper({ queryClient, searchStatus }),
    ...renderOpts,
  });
}
