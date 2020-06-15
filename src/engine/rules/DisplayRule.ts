import rootStore from 'src/stores';
import { RuleSchema, RuleHandler } from 'src/types';

const DisplayRule: RuleHandler = (rule: RuleSchema) => {
  console.log('handling a display rule');
  setTimeout(() => {

    rootStore.alertStore.update({ canClose: true });
  }, 2000);
};

export default DisplayRule;