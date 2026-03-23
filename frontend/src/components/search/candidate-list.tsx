import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRunFullSearch } from '@/hooks/use-run-full-search';
import { useSearch } from '@/hooks/use-search';
import { useSearchStatus } from '@/hooks/use-search-status';
import { useStopSearch } from '@/hooks/use-stop-search';
import { useRoleCandidates } from '@/hooks/use-role-candidates';
import { ItemGroup } from '../ui/item';
import { CandidateItem } from '../common/candidate-item';
import type { CandidateSchema } from '@/lib/api';
import { useSearchStatusContext } from '@/contexts/search-status-context';
import { suggestedFilters, type FilterFormValues } from './filters/schema';

const PREVIEW_LIMIT_OPTIONS = [25, 50, 100, 200, 500];
const VIRTUALIZE_THRESHOLD = 200;

interface CandidateListProps {
  roleId: string;
  filters: FilterFormValues | null;
  savedFilters: FilterFormValues | null;
  onApplyFilters: (filters: FilterFormValues) => void;
}

export function CandidateList({ roleId, filters, savedFilters, onApplyFilters }: CandidateListProps) {
  const [previewLimit, setPreviewLimit] = useState(PREVIEW_LIMIT_OPTIONS[0]);
  const { data: previewData, isLoading: isPreviewLoading, isError, error } = useSearch(filters, previewLimit);
  const { mutate, isPending, data: runData, error: runError } = useRunFullSearch(roleId);

  const searchId = runData?.search_id ?? null;
  const { data: statusData } = useSearchStatus(roleId, searchId);
  const searchStatus = statusData?.status;

  const isSearchRunning = isPending || searchStatus === 'running';
  const isSearchCompleted = searchStatus === 'completed';
  const isSearchFailed = searchStatus === 'failed';

  const { mutate: stopMutate, isPending: isStopPending } = useStopSearch(roleId, searchId);

  const { data: completedData, isLoading: isCompletedLoading } = useRoleCandidates(roleId, isSearchCompleted);

  const isLoading = isPreviewLoading || isCompletedLoading;

  const candidates: CandidateSchema[] = isSearchCompleted
    ? (completedData?.candidates ?? [])
    : (previewData?.candidates ?? []);
  const previewCount = isSearchCompleted ? candidates.length : (previewData?.preview_count ?? 0);
  const totalCount = isSearchCompleted ? candidates.length : (previewData?.total_count ?? 0);

  const hasFullSearchResult = isSearchCompleted && !isCompletedLoading;
  const hasError = isError || isSearchFailed;

  const { setSearchStatus } = useSearchStatusContext();

  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = candidates.length > VIRTUALIZE_THRESHOLD;
  const virtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 80,
    overscan: 10,
    enabled: shouldVirtualize,
  });

  useEffect(() => {
    if (isSearchRunning) {
      setSearchStatus('Running');
    } else if (isSearchCompleted) {
      setSearchStatus('Completed');
    } else if (isSearchFailed) {
      setSearchStatus('Failed');
    } else {
      setSearchStatus('Draft');
    }

    return () => setSearchStatus(null);
  }, [isSearchRunning, isSearchCompleted, isSearchFailed, setSearchStatus]);
  const errorMessage = runError instanceof Error
    ? runError.message
    : error instanceof Error
      ? error.message
      : 'Search failed. Please try again.';

  return (
    <div className="">
      <div className="flex items-center justify-end gap-2 px-4 py-2 h-11 border-gray-200 shrink-0">
        {isSearchRunning ? (
          <>
            <span className="text-xs text-muted-foreground">Full search running</span>
            <Button
              size="sm"
              variant="outline"
              type="button"
              disabled={isStopPending}
              onClick={() => stopMutate()}
            >
              Stop run
            </Button>
          </>
        ) : (
          <>
            {(previewData || hasFullSearchResult) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {hasFullSearchResult ? (
                  <>
                    Showing <span className="font-medium text-foreground">{previewCount}</span> out of{' '}
                    <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    Previewing
                    <Select
                      value={String(previewLimit)}
                      onValueChange={(v) => setPreviewLimit(Number(v))}
                    >
                      <SelectTrigger size="sm" className="w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PREVIEW_LIMIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={String(opt)} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    out of{' '}
                    <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
                  </>
                )}
              </span>
            )}
            <Button
              size="sm"
              variant="default"
              type="button"
              disabled={!filters || isPending || isSearchCompleted}
              onClick={() => filters && mutate(filters)}
            >
              Run full search
            </Button>
          </>
        )}
      </div>

      {!isSearchRunning && !isLoading && !hasError && shouldVirtualize ? (
        <div
          ref={scrollRef}
          className="flex-1 border-t border-gray-200 h-[calc(100vh-101px)] overflow-y-auto"
        >
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const candidate = candidates[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualItem.start}px)` }}
                  className="p-1"
                >
                  <CandidateItem
                    name={candidate.name}
                    title={candidate.title}
                    company={candidate.company}
                    headline={candidate.headline}
                    summary={candidate.summary}
                    avatarUrl={candidate.avatar_url ?? undefined}
                    tier={candidate.tier ?? undefined}
                    status={candidate.status ? { approved: candidate.status.approved, reason: candidate.status.reason ?? '' } : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 border-t border-gray-200 h-[calc(100vh-101px)]">
          {isSearchRunning && (
            <div className="flex flex-col items-center justify-center gap-3 h-48 text-center">
              <p className="text-sm font-medium">Full search running...</p>
              <p className="text-xs text-muted-foreground">This may take a few minutes. You can stop it at any time.</p>
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={isStopPending}
                onClick={() => stopMutate()}
              >
                Stop run
              </Button>
            </div>
          )}

          {!isSearchRunning && isLoading && (
            <div className="p-2 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2">
                  <div className="size-9 rounded-full bg-muted shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearchRunning && !isLoading && hasError && (
            <div className="flex items-center justify-center h-48 px-6 text-center">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {!isSearchRunning && !isLoading && !hasError && candidates.length > 0 && (
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

          {!isSearchRunning && !isLoading && !hasError && candidates.length === 0 && !isSearchCompleted && (
            <div className="flex flex-col items-center justify-center gap-3 h-48 text-center">
              <p className="text-sm text-muted-foreground">Apply filters and search to see candidates.</p>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => onApplyFilters(savedFilters ?? suggestedFilters)}
              >
                {savedFilters ? 'Apply last search filters' : 'Apply suggested filters'}
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
