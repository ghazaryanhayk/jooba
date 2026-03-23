import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type TierFilter = 'all' | 'A' | 'B' | 'C' | 'D' | 'F';
export type DecisionFilter = 'all' | 'approved' | 'rejected';

interface RankedListToolbarProps {
  tierFilter: TierFilter;
  decisionFilter: DecisionFilter;
  onTierChange: (v: TierFilter) => void;
  onDecisionChange: (v: DecisionFilter) => void;
  isPreviewing: boolean;
  isLoading: boolean;
  canPreview: boolean;
  onPreview: () => void;
  previewLimit: number;
  onPreviewLimitChange: (v: number) => void;
  totalCount: number;
  previewLimitOptions: number[];
}

export function RankedListToolbar({
  tierFilter,
  decisionFilter,
  onTierChange,
  onDecisionChange,
  isPreviewing,
  isLoading,
  canPreview,
  onPreview,
  previewLimit,
  onPreviewLimitChange,
  totalCount,
  previewLimitOptions,
}: RankedListToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 h-11 shrink-0">
      <div className="flex items-center gap-2">
        <Select value={tierFilter} onValueChange={(v) => onTierChange(v as TierFilter)}>
          <SelectTrigger size="sm" className="w-auto gap-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="A">A tier</SelectItem>
            <SelectItem value="B">B tier</SelectItem>
            <SelectItem value="C">C tier</SelectItem>
            <SelectItem value="D">D tier</SelectItem>
            <SelectItem value="F">F tier</SelectItem>
          </SelectContent>
        </Select>

        <Select value={decisionFilter} onValueChange={(v) => onDecisionChange(v as DecisionFilter)}>
          <SelectTrigger size="sm" className="w-auto gap-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All decisions</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {totalCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Previewing
            <Select value={String(previewLimit)} onValueChange={(v) => onPreviewLimitChange(Number(v))}>
              <SelectTrigger size="sm" className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {previewLimitOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            out of <span className="font-medium text-foreground">{totalCount}</span>
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={isPreviewing || isLoading || !canPreview}
          onClick={onPreview}
        >
          {isPreviewing && <Loader2Icon className="animate-spin" />}
          Preview
        </Button>
        <Button size="sm" variant="outline" disabled>Run full ranking</Button>
        <Button size="sm" variant="default" disabled>Publish</Button>
      </div>
    </div>
  );
}
