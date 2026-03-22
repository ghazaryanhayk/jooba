import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useRunFullSearch } from '@/hooks/use-run-full-search';
import { useSearch } from '@/hooks/use-search';
import { useSearchStatus } from '@/hooks/use-search-status';
import { useRoleCandidates } from '@/hooks/use-role-candidates';
import { ItemGroup } from '../ui/item';
import { CandidateItem } from '../common/candidate-item';
import type { CandidateSchema } from '@/lib/api';
import { suggestedFilters, type FilterFormValues } from './filters/schema';

interface CandidateListProps {
  roleId: string;
  filters: FilterFormValues | null;
  savedFilters: FilterFormValues | null;
  onApplyFilters: (filters: FilterFormValues) => void;
}

export function CandidateList({ roleId, filters, savedFilters, onApplyFilters }: CandidateListProps) {
  const { data: previewData, isLoading: isPreviewLoading, isError, error } = useSearch(filters);
  const { mutate, isPending, data: runData, error: runError } = useRunFullSearch(roleId);

  const searchId = runData?.search_id ?? null;
  const { data: statusData } = useSearchStatus(roleId, searchId);
  const searchStatus = statusData?.status;

  const isSearchRunning = isPending || searchStatus === 'running';
  const isSearchCompleted = searchStatus === 'completed';
  const isSearchFailed = searchStatus === 'failed';

  const { data: completedData, isLoading: isCompletedLoading } = useRoleCandidates(roleId, isSearchCompleted);

  const isLoading = isPreviewLoading || isSearchRunning || isCompletedLoading;

  const candidates: CandidateSchema[] = isSearchCompleted
    ? (completedData?.candidates ?? [])
    : (previewData?.candidates ?? []);
  const previewCount = isSearchCompleted ? candidates.length : (previewData?.preview_count ?? 0);
  const totalCount = isSearchCompleted ? candidates.length : (previewData?.total_count ?? 0);

  const hasFullSearchResult = isSearchCompleted && !isCompletedLoading;
  const hasError = isError || isSearchFailed;
  const errorMessage = runError instanceof Error
    ? runError.message
    : error instanceof Error
      ? error.message
      : 'Search failed. Please try again.';

  return (
    <div className="">
      <div className="flex items-center justify-end gap-2 px-4 py-2 h-11 border-gray-200 shrink-0">
        {(previewData || hasFullSearchResult) && (
          <span className="text-xs text-muted-foreground">
            {hasFullSearchResult ? (
              <>
                Showing <span className="font-medium text-foreground">{previewCount}</span> out of{' '}
                <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
              </>
            ) : (
              <>
                Previewing <span className="font-medium text-foreground">{previewCount}</span> out of{' '}
                <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
              </>
            )}
          </span>
        )}
        <Button
          size="sm"
          variant="default"
          type="button"
          disabled={!filters || isSearchRunning || isSearchCompleted}
          onClick={() => filters && mutate(filters)}
        >
          {isSearchRunning ? 'Searching…' : 'Run full search'}
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

        {!isLoading && hasError && (
          <div className="flex items-center justify-center h-48 px-6 text-center">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !hasError && candidates.length > 0 && (
          <ItemGroup className="p-1 gap-1">
            {candidates.map((candidate, index) => (
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

        {!isLoading && !hasError && candidates.length === 0 && !isSearchCompleted && (
          <div className="flex flex-col items-center justify-center gap-3 h-48 text-center">
            <p className="text-sm text-muted-foreground">Apply filters and search to see candidates.</p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => onApplyFilters(savedFilters ?? suggestedFilters)}
            >
              {savedFilters ? 'Apply last search' : 'Apply suggested filters'}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
