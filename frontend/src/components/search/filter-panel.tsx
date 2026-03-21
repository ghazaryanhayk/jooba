import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const FILTER_SECTIONS = [
  {
    label: 'Person',
    filters: ['Title', 'Country', 'State / Province', 'Region / City', 'Keywords', 'Skills', 'Languages'],
  },
  {
    label: 'Company',
    filters: ['Name', 'HQ location', 'Domain', 'School', 'Degree', 'Field of study'],
  },
  {
    label: 'Experience',
    filters: ['Years total', 'Tenure', 'Connections'],
  },
  {
    label: 'Signals',
    filters: ['Open to work', 'Hiring manager', 'Recently changed jobs'],
  },
];

export function FilterPanel() {
  return (
    <div className="shrink-0 border-r h-full overflow-y-auto">
      <div className="pl-4 pr-1.5 py-2 h-11 flex items-center">
        <div className="flex items-center gap-2 flex-1">
          <h2 className="font-medium text-gray-900">Filters</h2>
          <Badge variant="default" className="rounded-sm p-1">4</Badge>
        </div>
        <Button variant="link" size="sm">Reset</Button>
      </div>
      <Accordion type="multiple">
        {FILTER_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="text-sm text-muted-foreground font-medium px-4 py-3 border-y border-gray-200 bg-gray-50">{section.label}</div>
            {section.filters.map((filter) => (
              <AccordionItem key={filter} value={`${section.label}-${filter}`}>
                <AccordionTrigger className="text-sm px-4 py-3 rounded-none hover:no-underline hover:bg-gray-50 items-center">
                  {filter}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2">
                  Filter options will go here...
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>
    </div>
  );
}
