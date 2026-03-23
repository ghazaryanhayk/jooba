import { createContext, useContext } from 'react';

export interface SearchStatusContextValue {
  searchStatus: string | null;
  setSearchStatus: (status: string | null) => void;
}

export const SearchStatusContext = createContext<SearchStatusContextValue>({
  searchStatus: null,
  setSearchStatus: () => {},
});

export function useSearchStatusContext() {
  return useContext(SearchStatusContext);
}
