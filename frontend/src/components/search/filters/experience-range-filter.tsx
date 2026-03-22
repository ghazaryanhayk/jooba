import { XIcon } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';

import type { FilterFormValues } from './schema';

export function ExperienceRangeFilter() {
  const { control, setValue } = useFormContext<FilterFormValues>();

  const clear = () => setValue('experience', { from: '', to: '' });

  return (
    <ButtonGroup className="w-full">
      <Controller
        control={control}
        name="experience.from"
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            min={0}
            placeholder="0"
          />
        )}
      />

      <ButtonGroupText>to</ButtonGroupText>

      <Controller
        control={control}
        name="experience.to"
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            min={0}
            placeholder="∞"
          />
        )}
      />

      <Button
        type="button"
        aria-label="Clear"
        size="icon"
        variant="outline"
        onClick={clear}
      >
        <XIcon />
      </Button>
    </ButtonGroup>
  );
}
