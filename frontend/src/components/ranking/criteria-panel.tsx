import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { criteriaSchema, defaultCriteriaValues, type CriteriaFormValues } from './criteria-schema';
import { CriteriaPanelHeader } from './criteria/criteria-panel-header';
import { CriteriaPanelBody } from './criteria/criteria-panel-body';

export function CriteriaPanel() {
  const methods = useForm<CriteriaFormValues>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: defaultCriteriaValues,
  });

  return (
    <FormProvider {...methods}>
      <form className="shrink-0 border-r">
        <CriteriaPanelHeader />
        <CriteriaPanelBody />
      </form>
    </FormProvider>
  );
}
