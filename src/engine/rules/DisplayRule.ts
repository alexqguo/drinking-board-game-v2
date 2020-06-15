import rootStore from 'src/stores';
import { RuleSchema, RuleHandler } from 'src/types';

const DisplayRule: RuleHandler = (rule: RuleSchema) => {
  console.log('handling a display rule');
  rootStore.alertStore.update({ canClose: true });
};

export default DisplayRule;