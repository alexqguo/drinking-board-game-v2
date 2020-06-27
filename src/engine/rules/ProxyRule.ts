import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, GameState } from 'src/types';
import { validateRequired } from 'src/engine/rules';

const ProxyRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, gameStore } = rootStore;

  if (!validateRequired(rule.proxyRuleId)) {
    console.error('proxyRuleId is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  gameStore.setGameState((rule.proxyRuleId as GameState));
};

export default ProxyRule;