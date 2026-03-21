import { FilterPanel } from '@/components/search/filter-panel';
import { CandidateList } from '@/components/search/candidate-list';

export function SearchPage() {
  return (
    <div className="grid grid-cols-12 border-t border-gray-200">
      <div className="col-span-3">
        <FilterPanel />
      </div>
      <div className="col-span-9">
        <CandidateList />
      </div>
    </div>
  );
}
