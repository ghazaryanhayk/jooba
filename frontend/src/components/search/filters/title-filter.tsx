import { PlusIcon, XIcon } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { FilterFormValues } from './schema';

type Operator = 'is' | 'is_not' | 'fuzzy' | 'exacte';
type Timeframe = 'current' | 'ever' | 'past';

const OPERATOR_LABELS: Record<Operator, string> = {
  is: 'Is',
  is_not: 'Is not',
  fuzzy: 'Fuzzy',
  exacte: 'Exacte',
};

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  current: 'Current',
  ever: 'Ever',
  past: 'Past',
};

export function TitleFilter() {
  const { control } = useFormContext<FilterFormValues>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'title',
  });

  const handleRemove = (index: number) => {
    if (fields.length === 1) {
      update(0, { operator: 'is', value: '', timeframe: 'current' });
      return;
    }
    remove(index);
  };

  const handleAppend = () => {
    append({ operator: 'is', value: '', timeframe: 'current' });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {fields.map((field, index) => {
        const isLast = index === fields.length - 1;
        return (
          <ButtonGroup key={field.id} className="w-full">
            <Controller
              control={control}
              name={`title.${index}.operator`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-1/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(Object.entries(OPERATOR_LABELS) as [Operator, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <Controller
              control={control}
              name={`title.${index}.value`}
              render={({ field }) => (
                <Input {...field} placeholder="Software engineer, PM" />
              )}
            />

            <Controller
              control={control}
              name={`title.${index}.timeframe`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-1/4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(Object.entries(TIMEFRAME_LABELS) as [Timeframe, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            {isLast ? (
              <Button
                type="button"
                aria-label="Add row"
                size="icon"
                variant="outline"
                onClick={handleAppend}
              >
                <PlusIcon />
              </Button>
            ) : (
              <Button
                type="button"
                aria-label="Remove row"
                size="icon"
                variant="outline"
                onClick={() => handleRemove(index)}
              >
                <XIcon />
              </Button>
            )}
          </ButtonGroup>
        );
      })}
    </div>
  );
}
