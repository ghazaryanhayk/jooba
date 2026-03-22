interface TierCounts {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

interface RankingStatsBarProps {
  approved: number;
  rejected: number;
  tierCounts: TierCounts;
}

export function RankingStatsBar({ approved, rejected, tierCounts }: RankingStatsBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-gray-200 shrink-0 h-10">
      <div className="flex items-center gap-5">
        {([
          { label: 'Approved', value: approved, color: 'bg-green-700' },
          { label: 'Rejected', value: rejected, color: 'bg-red-700' },
        ] as const).map((stat) => (
          <div key={stat.label} className="text-xs flex items-center gap-2">
            <span className={`${stat.color} inline-block rounded-full size-2`} />
            <span className="font-medium text-muted-foreground">{stat.label}</span>{' '}
            <span className="font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-5">
        {([
          { label: 'A tier', value: tierCounts.A, color: 'bg-green-700' },
          { label: 'B tier', value: tierCounts.B, color: 'bg-blue-700' },
          { label: 'C tier', value: tierCounts.C, color: 'bg-yellow-700' },
          { label: 'D tier', value: tierCounts.D, color: 'bg-orange-700' },
          { label: 'F tier', value: tierCounts.F, color: 'bg-red-700' },
        ] as const).map((tier) => (
          <div key={tier.label} className="text-xs flex items-center gap-2">
            <span className={`${tier.color} inline-block rounded-full size-2`} />
            <span className="font-medium text-muted-foreground">{tier.label}</span>{' '}
            <span className="font-semibold">{tier.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
