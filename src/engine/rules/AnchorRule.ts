import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';
import { validateRequired } from 'src/engine/rules';

const AnchorRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, playerStore, gameStore } = rootStore;

  if (!validateRequired(rule.numTurns)) {
    console.error('numTurns is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  await playerStore.updateEffects(gameStore.game.currentPlayerId, {
    anchors: rule.numTurns!
  });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default AnchorRule;