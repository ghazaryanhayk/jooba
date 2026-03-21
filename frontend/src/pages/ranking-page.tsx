import { CriteriaPanel } from '@/components/ranking/criteria-panel';
import { RankedCandidateList } from '@/components/ranking/ranked-candidate-list';

export function RankingPage() {
  return (
    <div className="grid grid-cols-12 border-t border-gray-200">
      <div className="col-span-3">
        <CriteriaPanel />
      </div>
      <div className="col-span-9">
        <RankedCandidateList />
      </div>
    </div>
  );
}
