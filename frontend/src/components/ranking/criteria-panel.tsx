import { CriteriaPanelHeader } from './criteria/criteria-panel-header';
import { CriteriaPanelBody } from './criteria/criteria-panel-body';

export function CriteriaPanel() {
  return (
    <form className="shrink-0 border-r">
      <CriteriaPanelHeader />
      <CriteriaPanelBody />
    </form>
  );
}
