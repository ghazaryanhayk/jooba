import { FilterPanel } from '@/components/search/filter-panel';
import { EmptyState } from '@/components/search/empty-state';

export function SearchPage() {
  return (

    <div className="h-full grid grid-cols-12 border-t border-gray-200">
      <div className="col-span-3">
        <FilterPanel />
      </div>
      <div className="col-span-9 flex">
        <EmptyState />
      </div>
    </div>
  );
}
