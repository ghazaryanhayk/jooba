import { Badge } from "@/components/ui/badge";
import { CriteriaFormValues } from "../criteria-schema";
import { useFormContext, useWatch } from "react-hook-form";

function useCriteriaCounts() {
  const { control } = useFormContext<CriteriaFormValues>();
  const generalIntuition = useWatch({ control, name: 'general_intuition' });
  const mustHaves = useWatch({ control, name: 'must_haves' });
  const niceToHaves = useWatch({ control, name: 'nice_to_haves' });

  const generalCount = generalIntuition?.trim() ? 1 : 0;
  const mustHavesCount = mustHaves?.filter(item => item.value.trim()).length ?? 0;
  const niceToHavesCount = niceToHaves?.filter(item => item.value.trim()).length ?? 0;

  return { total: generalCount + mustHavesCount + niceToHavesCount };
}

export function CriteriaPanelHeader() {
  const { total } = useCriteriaCounts();

  return (
    <div className="pl-4 pr-1.5 py-2 h-11 flex items-center">
      <div className="flex items-center gap-2 flex-1">
        <h2 className="font-medium text-gray-900">Criteria</h2>
        {total > 0 && (
          <Badge variant="default" className="rounded-sm p-1">
            {total}
          </Badge>
        )}
      </div>
    </div>
  );
}