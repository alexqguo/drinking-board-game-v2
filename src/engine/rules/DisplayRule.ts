import rootStore from 'src/stores';
import { RuleSchema, RuleHandler } from 'src/types';

const DisplayRule: RuleHandler = (rule: RuleSchema) => {
  setTimeout(() => {
    rootStore.alertStore.update({ canClose: true });
  }, 3000);
};

export default DisplayRule;