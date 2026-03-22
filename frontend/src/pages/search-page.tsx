import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { CandidateList } from '@/components/search/candidate-list';
import { FilterPanel } from '@/components/search/filter-panel';
import type { FilterFormValues } from '@/components/search/filters/schema';

export function SearchPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const [filters, setFilters] = useState<FilterFormValues | null>(null);

  return (
    <div className="grid grid-cols-12 border-t border-gray-200">
      <div className="col-span-3">
        <FilterPanel onSearch={setFilters} />
      </div>
      <div className="col-span-9">
        <CandidateList roleId={roleId!} filters={filters} />
      </div>
    </div>
  );
}
