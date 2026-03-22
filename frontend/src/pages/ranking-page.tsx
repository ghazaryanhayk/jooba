import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { criteriaSchema, defaultCriteriaValues, type CriteriaFormValues } from '@/components/ranking/criteria-schema';
import { CriteriaPanel } from '@/components/ranking/criteria-panel';
import { RankedCandidateList } from '@/components/ranking/ranked-candidate-list';
import { useRunRanking } from '@/hooks/use-run-ranking';
import type { CandidateSchema } from '@/lib/api';

export function RankingPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const [rankedCandidates, setRankedCandidates] = useState<CandidateSchema[] | null>(null);

  const methods = useForm<CriteriaFormValues>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: defaultCriteriaValues,
  });

  const { mutate: runRanking, isPending } = useRunRanking();

  const handlePreview = (candidates: CandidateSchema[]) => {
    const criteria = methods.getValues();
    runRanking(
      { candidates, criteria },
      { onSuccess: (data) => setRankedCandidates(data.candidates) },
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-12 border-t border-gray-200">
        <div className="col-span-3">
          <CriteriaPanel />
        </div>
        <div className="col-span-9">
          <RankedCandidateList
            roleId={roleId!}
            rankedCandidates={rankedCandidates}
            onPreview={handlePreview}
            isPreviewing={isPending}
          />
        </div>
      </div>
    </FormProvider>
  );
}
