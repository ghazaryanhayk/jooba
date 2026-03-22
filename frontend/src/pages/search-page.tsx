import { useState } from 'react';

import { CandidateList } from '@/components/search/candidate-list';
import { FilterPanel } from '@/components/search/filter-panel';
import type { FilterFormValues } from '@/components/search/filters/schema';

export function SearchPage() {
  const [filters, setFilters] = useState<FilterFormValues | null>(null);

  return (
    <div className="grid grid-cols-12 border-t border-gray-200">
      <div className="col-span-3">
        <FilterPanel onSearch={setFilters} />
      </div>
      <div className="col-span-9">
        <CandidateList filters={filters} />
      </div>
    </div>
  );
}
