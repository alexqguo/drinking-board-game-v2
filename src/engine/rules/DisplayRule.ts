import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

const DisplayRule: RuleHandler = (rule: RuleSchema) => {
  rootStore.alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default DisplayRule;