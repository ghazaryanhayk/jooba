import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ScrollArea } from '../ui/scroll-area';
import { CountryFilter } from './filters/country-filter';
import { ExperienceRangeFilter } from './filters/experience-range-filter';
import { defaultFilterValues, filterSchema, type FilterFormValues } from './filters/schema';
import { TitleFilter } from './filters/title-filter';
import { FilterPanelHeader } from './filters/filter-panel-header';
import { ChevronRightIcon } from 'lucide-react';

const FILTERS: Record<string, { label: string, value: string, component?: React.ReactNode }[]> = {
  Person: [
    { label: 'Title', value: 'title', component: <TitleFilter /> },
    { label: 'Country', value: 'country', component: <CountryFilter /> },
    { label: 'State / Province', value: 'state' },
    { label: 'Region / City', value: 'city' },
    { label: 'Keywords', value: 'keywords' },
    { label: 'Skills', value: 'skills' },
    { label: 'Languages', value: 'languages' },
  ],
  Company: [
    { label: 'Name', value: 'name' },
    { label: 'HQ location', value: 'hq_location' },
    { label: 'Domain', value: 'domain' },
    { label: 'School', value: 'school' },
    { label: 'Degree', value: 'degree' },
    { label: 'Field of study', value: 'field_of_study' },
  ],
  Experience: [
    { label: 'Years total', value: 'years_experience_min', component: <ExperienceRangeFilter /> },
    { label: 'Tenure', value: 'tenure_months_min' },
    { label: 'Connections', value: 'connections_min' },
  ],
  Signals: [
    { label: 'Open to work', value: 'open_to_work' },
    { label: 'Hiring manager', value: 'is_hiring_manager' },
    { label: 'Recently changed jobs', value: 'recently_changed_jobs' },
  ],
}

export function FilterPanel() {
  const methods = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: defaultFilterValues,
  });

  const onSubmit = (data: FilterFormValues) => {
    console.log('Filter values:', data);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="shrink-0 border-r"
      >
        <FilterPanelHeader />

        <ScrollArea className="h-[calc(100vh-101px)] border-t border-gray-200">
          <div>
            {Object.entries(FILTERS).map(([key, filters]) => (
              <div key={key}>
                <div className="text-sm text-muted-foreground font-medium px-4 py-3 border-b border-gray-200 bg-gray-50">
                  {key}
                </div>
                {filters.map((filter) => (
                  <Collapsible key={filter.value} className="border-b border-gray-200">
                    <CollapsibleTrigger asChild className="text-sm px-4 py-3 rounded-none hover:bg-gray-50 items-center w-full">
                      <div className="group flex items-center justify-between gap-1.5">
                        {filter.label}
                        <ChevronRightIcon className="size-3 group-data-[state=open]:rotate-90 disabled:opacity-50" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 py-2">
                      {filter.component}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </form>
    </FormProvider >
  );
}
