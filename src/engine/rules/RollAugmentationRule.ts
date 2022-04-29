import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertState,
} from 'src/types';
import { validateRequired } from 'src/engine/rules';

const RollAugmentationRule: RuleHandler = async (rule: RuleSchema) => {
  const { modifier } = rule;
  const { alertStore, playerStore, gameStore } = rootStore;

  if (!validateRequired(modifier)) {
    console.error('modifier is a required fields', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  playerStore.updateEffects(gameStore.game.currentPlayerId, {
    rollAugmentation: {
      numTurns: 1,
      operation: modifier![0],
      modifier: modifier![1],
    },
  });

  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default RollAugmentationRule