import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';

const ReverseTurnOrderRule: RuleHandler = async (rule: RuleSchema) => {
  const { gameStore, alertStore } = rootStore;

  const currentTurnOrder = gameStore.game.turnOrder;
  await gameStore.update({ turnOrder: currentTurnOrder * -1 });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default ReverseTurnOrderRule;