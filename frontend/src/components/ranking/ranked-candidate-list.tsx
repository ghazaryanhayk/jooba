import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ItemGroup } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoleCandidates } from '@/hooks/use-role-candidates';
import type { CandidateSchema } from '@/lib/api';
import { CandidateItem } from '../common/candidate-item';

interface RankedCandidateListProps {
  roleId: string;
  rankedCandidates: CandidateSchema[] | null;
  onPreview: (candidates: CandidateSchema[]) => void;
  isPreviewing: boolean;
}

const STATS = [
  { label: 'Approved', value: 43, color: 'bg-green-700' },
  { label: 'Rejected', value: 47, color: 'bg-red-700' },
];

const TIERS = [
  { label: 'A tier', value: 14, color: 'bg-green-700' },
  { label: 'B tier', value: 9, color: 'bg-blue-700' },
  { label: 'C tier', value: 2, color: 'bg-yellow-700' },
  { label: 'D tier', value: 50, color: 'bg-orange-700' },
  { label: 'F tier', value: 75, color: 'bg-red-700' },
];

export function RankedCandidateList({ roleId, rankedCandidates, onPreview, isPreviewing }: RankedCandidateListProps) {
  const { data, isLoading, isError, error } = useRoleCandidates(roleId);

  const sourceCandidates = data?.candidates ?? [];
  const candidates = rankedCandidates ?? sourceCandidates;

  return (
    <div className="">
      <div className="flex items-center justify-end gap-2 px-4 py-2 h-11 shrink-0">
        {data && (
          <span className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{candidates.length}</span> candidates
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={isPreviewing || isLoading || sourceCandidates.length === 0}
          onClick={() => onPreview(sourceCandidates)}
        >
          {isPreviewing && <Loader2Icon className="animate-spin" />}
          Preview
        </Button>
        <Button size="sm" variant="outline" disabled>Run full ranking</Button>
        <Button size="sm" variant="default" disabled>Publish</Button>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-gray-200 shrink-0 h-10">
        <div className="flex items-center gap-5">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-xs flex items-center gap-2">
              <span className={`${stat.color} inline-block rounded-full size-2`} />
              <span className="font-medium text-muted-foreground">{stat.label}</span>{' '}
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-5">
          {TIERS.map((tier) => (
            <div key={tier.label} className="text-xs flex items-center gap-2">
              <span className={`${tier.color} inline-block rounded-full size-2`} />
              <span className="font-medium text-muted-foreground">{tier.label}</span>{' '}
              <span className="font-semibold">{tier.value}</span>
            </div>
          ))}
        </div>
      </div>

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

        {!isLoading && !isError && candidates.length > 0 && (
          <ItemGroup className="p-1 gap-1">
            {candidates.map((candidate) => (
              <CandidateItem
                key={candidate.name}
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

        {!isLoading && !isError && candidates.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">No candidates found. Run a full search first.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
