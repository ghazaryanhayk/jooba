import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CandidateList } from '@/components/search/candidate-list';
import { FilterPanel } from '@/components/search/filter-panel';
import type { FilterFormValues } from '@/components/search/filters/schema';
import { useRoleFilters } from '@/hooks/use-role-filters';

export function SearchPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const [filters, setFilters] = useState<FilterFormValues | null>(null);
  const [pendingExternalFilters, setPendingExternalFilters] = useState<FilterFormValues | null>(null);

  useEffect(() => {
    setFilters(null);
    setPendingExternalFilters(null);
  }, [roleId]);

  const { data: roleFiltersData } = useRoleFilters(roleId!);
  const savedFilters = roleFiltersData?.filters ?? null;

  const handleApplyFilters = (f: FilterFormValues) => {
    setFilters(f);
    setPendingExternalFilters(f);
  };

  return (
    <div className="grid grid-cols-12 border-t border-gray-200">
      <div className="col-span-3">
        <FilterPanel onSearch={setFilters} externalFilters={pendingExternalFilters} />
      </div>
      <div className="col-span-9">
        <CandidateList
          key={roleId}
          roleId={roleId!}
          filters={filters}
          savedFilters={savedFilters}
          onApplyFilters={handleApplyFilters}
        />
      </div>
    </div>
  );
}
