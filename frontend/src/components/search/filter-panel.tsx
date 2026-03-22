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

const PERSON_FILTERS = ['Title', 'Country', 'State / Province', 'Region / City', 'Keywords', 'Skills', 'Languages'];
const COMPANY_FILTERS = ['Name', 'HQ location', 'Domain', 'School', 'Degree', 'Field of study'];
const EXPERIENCE_FILTERS = ['Years total', 'Tenure', 'Connections'];
const SIGNAL_FILTERS = ['Open to work', 'Hiring manager', 'Recently changed jobs'];

const FILTER_SECTIONS = [
  { label: 'Person', filters: PERSON_FILTERS },
  { label: 'Company', filters: COMPANY_FILTERS },
  { label: 'Experience', filters: EXPERIENCE_FILTERS },
  { label: 'Signals', filters: SIGNAL_FILTERS },
];

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
            {FILTER_SECTIONS.map((section, index) => (
              <div key={section.label + index}>
                <div className="text-sm text-muted-foreground font-medium px-4 py-3 border-b border-gray-200 bg-gray-50">
                  {section.label}
                </div>

                {section.filters.map((filter, index) => {
                  return (
                    <Collapsible key={filter + index} className="border-b border-gray-200">
                      <CollapsibleTrigger asChild className="text-sm px-4 py-3 rounded-none hover:bg-gray-50 items-center w-full">
                        <div className="group flex items-center justify-between gap-1.5">
                          {filter}
                          <ChevronRightIcon className="size-3 group-data-[state=open]:rotate-90" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 py-2">
                        {filter === 'Years total' && <ExperienceRangeFilter />}
                        {filter === 'Country' && <CountryFilter />}
                        {filter === 'Title' && <TitleFilter />}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </form>
    </FormProvider>
  );
}
