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

type Operator = 'is' | 'is_not';

const OPERATOR_LABELS: Record<Operator, string> = {
  is: 'Is',
  is_not: 'Is not',
};

export function CountryFilter() {
  const { control } = useFormContext<FilterFormValues>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'country',
  });

  const handleRemove = (index: number) => {
    if (fields.length === 1) {
      update(0, { operator: 'is', value: '' });
      return;
    }
    remove(index);
  };

  const handleAppend = () => {
    append({ operator: 'is', value: '' });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {fields.map((field, index) => {
        const isLast = index === fields.length - 1;
        return (
          <ButtonGroup key={field.id} className="w-full">
            <Controller
              control={control}
              name={`country.${index}.operator`}
              render={({ field: f }) => (
                <Select value={f.value} onValueChange={f.onChange}>
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
              name={`country.${index}.value`}
              render={({ field: f }) => (
                <Input {...f} placeholder="United States, Canada" />
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
