import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { defaultFilterValues, type FilterFormValues } from "./schema";
import { useFormContext } from "react-hook-form";
import { SearchIcon } from "lucide-react";

function useFilterCounts() {
  const { formState } = useFormContext<FilterFormValues>();

  const titleCount = formState.dirtyFields.title?.length ?? 0;
  const countryCount = formState.dirtyFields.country?.length ?? 0;
  const experienceCount = (formState.dirtyFields.experience?.from !== undefined || formState.dirtyFields.experience?.to !== undefined) ? 1 : 0;

  return {
    total: titleCount + countryCount + experienceCount,
  };
}

export function FilterPanelHeader() {
  const { reset } = useFormContext<FilterFormValues>();
  const { total: activeCount } = useFilterCounts();

  return (
    <div className="pl-4 pr-1.5 py-2 h-11 flex items-center">
      <div className="flex items-center gap-2 flex-1">
        <h2 className="font-medium text-gray-900">Filters</h2>
        {activeCount > 0 && (
          <Badge variant="default" className="rounded-sm p-1">
            {activeCount}
          </Badge>
        )}
      </div>
      {activeCount > 0 && (
        <>
          <Button type="button" variant="link" size="sm" onClick={() => reset(defaultFilterValues)}>
            Reset
          </Button>
          <Button type="submit" variant="outline" size="sm">
            <SearchIcon className="size-3.5" /> Search
          </Button>
        </>
      )}
    </div>
  );
}