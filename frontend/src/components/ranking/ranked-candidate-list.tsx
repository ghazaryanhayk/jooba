import { useState } from 'react';

import { ItemGroup } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoleCandidates } from '@/hooks/use-role-candidates';
import type { CandidateSchema } from '@/lib/api';
import { CandidateItem } from '../common/candidate-item';
import { RankedListToolbar, type DecisionFilter, type TierFilter } from './ranked-list-toolbar';
import { RankingStatsBar } from './ranking-stats-bar';

interface RankedCandidateListProps {
  roleId: string;
  rankedCandidates: CandidateSchema[] | null;
  onPreview: (candidates: CandidateSchema[]) => void;
  isPreviewing: boolean;
}

const TIER_ORDER = { A: 0, B: 1, C: 2, D: 3, F: 4 } as const;

export function RankedCandidateList({ roleId, rankedCandidates, onPreview, isPreviewing }: RankedCandidateListProps) {
  const { data, isLoading, isError, error } = useRoleCandidates(roleId);
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>('all');

  const sourceCandidates = data?.candidates ?? [];
  const candidates = rankedCandidates ?? sourceCandidates;

  const sortedCandidates = [...candidates].sort((a, b) => {
    const aRank = a.tier != null ? TIER_ORDER[a.tier] : 99;
    const bRank = b.tier != null ? TIER_ORDER[b.tier] : 99;
    return aRank - bRank;
  });

  const filteredCandidates = sortedCandidates
    .filter((c) => tierFilter === 'all' || c.tier === tierFilter)
    .filter((c) => {
      if (decisionFilter === 'approved') return c.status?.approved === true;
      if (decisionFilter === 'rejected') return c.status?.approved === false;
      return true;
    });

  const approved = candidates.filter((c) => c.status?.approved === true).length;
  const rejected = candidates.length - approved;
  const tierCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  candidates.forEach((c) => { if (c.tier) tierCounts[c.tier]++; });

  return (
    <div className="">
      <RankedListToolbar
        tierFilter={tierFilter}
        decisionFilter={decisionFilter}
        onTierChange={setTierFilter}
        onDecisionChange={setDecisionFilter}
        filteredCount={filteredCandidates.length}
        showCount={!!data}
        isPreviewing={isPreviewing}
        isLoading={isLoading}
        canPreview={sourceCandidates.length > 0}
        onPreview={() => onPreview(sourceCandidates)}
      />

      {rankedCandidates !== null && (
        <RankingStatsBar approved={approved} rejected={rejected} tierCounts={tierCounts} />
      )}

      <ScrollArea className="flex-1 border-t border-gray-200 h-[calc(100vh-145px)]">
        {isLoading && (
          <div className="p-2 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-48 px-6 text-center">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load candidates.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredCandidates.length > 0 && (
          <ItemGroup className="p-1 gap-1">
            {filteredCandidates.map((candidate, index) => (
              <CandidateItem
                key={candidate.name + index}
                name={candidate.name}
                title={candidate.title}
                company={candidate.company}
                headline={candidate.headline}
                summary={candidate.summary}
                avatarUrl={candidate.avatar_url ?? undefined}
                tier={candidate.tier ?? undefined}
                status={candidate.status ? { approved: candidate.status.approved, reason: candidate.status.reason ?? '' } : undefined}
              />
            ))}
          </ItemGroup>
        )}

        {!isLoading && !isError && filteredCandidates.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">
              {candidates.length === 0 ? 'No candidates found. Run a full search first.' : 'No candidates match the selected filters.'}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
