import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/hooks/use-search';
import { ItemGroup } from '../ui/item';
import { CandidateItem } from '../common/candidate-item';
import type { FilterFormValues } from './filters/schema';

interface CandidateListProps {
  filters: FilterFormValues | null;
}

export function CandidateList({ filters }: CandidateListProps) {
  const { data, isLoading, isError, error } = useSearch(filters);

  return (
    <div className="">
      <div className="flex items-center justify-end gap-2 px-4 py-2 h-11 border-gray-200 shrink-0">
        {data && (
          <span className="text-xs text-muted-foreground">
            Previewing <span className="font-medium text-foreground">{data.preview_count}</span> out of{' '}
            <span className="font-medium text-foreground">{data.total_count.toLocaleString()}</span>
          </span>
        )}
        <Button size="sm" variant="default" type="button">
          Run full search
        </Button>
      </div>

      <ScrollArea className="flex-1 border-t border-gray-200 h-[calc(100vh-101px)]">
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
              {error instanceof Error ? error.message : 'Search failed. Please try again.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <ItemGroup className="p-1 gap-1">
            {data.candidates.map((candidate) => (
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

        {!isLoading && !isError && !data && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-muted-foreground">Apply filters and search to see candidates.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
