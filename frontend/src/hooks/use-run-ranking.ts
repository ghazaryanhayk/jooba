import { useMutation } from '@tanstack/react-query';

import type { CriteriaFormValues } from '@/components/ranking/criteria-schema';
import type { CandidateSchema } from '@/lib/api';
import { runRanking } from '@/lib/api';

interface RunRankingParams {
  candidates: CandidateSchema[];
  criteria: CriteriaFormValues;
}

export function useRunRanking() {
  return useMutation({
    mutationFn: ({ candidates, criteria }: RunRankingParams) =>
      runRanking(candidates, criteria),
  });
}
