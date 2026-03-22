import { ChevronRightIcon, PlusIcon, XIcon } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';


import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { type CriteriaFormValues } from '../criteria-schema';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function CriteriaPanelBody() {
  const { control } = useFormContext<CriteriaFormValues>();

  const mustHaves = useFieldArray({ control, name: 'must_haves' });
  const niceToHaves = useFieldArray({ control, name: 'nice_to_haves' });

  return (
    <ScrollArea className="h-[calc(100vh-101px)] border-t border-gray-200">

      <Collapsible className="border-b border-gray-200">
        <CollapsibleTrigger asChild className="text-sm px-4 py-3 rounded-none hover:bg-gray-50 items-center w-full">
          <div className="group flex items-center justify-between gap-1.5">
            General intuition
            <ChevronRightIcon className="size-3 group-data-[state=open]:rotate-90 disabled:opacity-50" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 py-2">
          <InputGroup>
            <Controller
              control={control}
              name="general_intuition"
              render={({ field }) => (
                <InputGroupTextarea
                  {...field}
                  placeholder="Lorem ipsum dolor sit amet"
                  rows={3}
                />
              )}
            />
          </InputGroup>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="border-b border-gray-200">
        <CollapsibleTrigger asChild className="text-sm px-4 py-3 rounded-none hover:bg-gray-50 items-center w-full">
          <div className="group flex items-center justify-between gap-1.5">
            Must haves
            <ChevronRightIcon className="size-3 group-data-[state=open]:rotate-90 disabled:opacity-50" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 py-2 space-y-2">
          {mustHaves.fields.map((field, i) => (
            <InputGroup key={field.id}>
              <Controller
                control={control}
                name={`must_haves.${i}.value`}
                render={({ field }) => (
                  <InputGroupTextarea
                    {...field}
                    placeholder="Lorem ipsum dolor sit amet"
                    rows={1}
                    className="min-h-6"
                  />
                )}
              />
              <InputGroupAddon align="inline-end" className="self-start">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => mustHaves.remove(i)}
                  aria-label="Remove"
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => mustHaves.append({ value: '' })}
            aria-label="Add"
          >
            Add <PlusIcon />
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="border-b border-gray-200">
        <CollapsibleTrigger asChild className="text-sm px-4 py-3 rounded-none hover:bg-gray-50 items-center w-full">
          <div className="group flex items-center justify-between gap-1.5">
            Nice to haves
            <ChevronRightIcon className="size-3 group-data-[state=open]:rotate-90 disabled:opacity-50" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 py-2 space-y-2">
          {niceToHaves.fields.map((field, i) => (
            <InputGroup key={field.id}>
              <Controller
                control={control}
                name={`nice_to_haves.${i}.value`}
                render={({ field }) => (
                  <InputGroupTextarea
                    {...field}
                    placeholder="Lorem ipsum dolor sit amet"
                    rows={1}
                    className="min-h-6"
                  />
                )}
              />
              <InputGroupAddon align="inline-end" className="self-start">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => niceToHaves.remove(i)}
                  aria-label="Remove"
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => niceToHaves.append({ value: '' })}
            aria-label="Add"
          >
            Add <PlusIcon />
          </Button>
        </CollapsibleContent>
      </Collapsible>

    </ScrollArea>
  );
}