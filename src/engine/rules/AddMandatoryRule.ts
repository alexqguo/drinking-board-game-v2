import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';
import { validateRequired } from 'src/engine/rules';

const AddMandatoryRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, playerStore, gameStore } = rootStore;

  if (!validateRequired(rule.tileIndex)) {
    console.error('tileIndex is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  await playerStore.updateEffects(gameStore.game.currentPlayerId, {
    customMandatoryTileIndex: rule.tileIndex,
  });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default AddMandatoryRule;