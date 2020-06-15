import rootStore from 'src/stores';
import { RuleSchema, RuleHandler } from 'src/types';

const DisplayRule: RuleHandler = (rule: RuleSchema) => {
  rootStore.alertStore.update({ canClose: true });
};

export default DisplayRule;