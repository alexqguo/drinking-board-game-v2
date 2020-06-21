import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

const DisplayRule: RuleHandler = (rule: RuleSchema) => {
  const { alertStore } = rootStore;
  setTimeout(() => {
    alertStore.update({ state: AlertState.CAN_CLOSE });
  }, 3000);
};

export default DisplayRule;