import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, PlayerTarget } from 'src/types';
import { validateOneOf } from 'src/engine/rules';

const UpdateStarterRule: RuleHandler = async (rule: RuleSchema) => {
  const { playerStore, gameStore, alertStore } = rootStore;
  const { starters, playerTarget } = rule;

  if (!validateOneOf(starters, playerTarget)) {
    console.error('starters is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const starterToReplaceWith = starters![0];

  if (starterToReplaceWith) {
    playerStore.updateEffects(gameStore.game.currentPlayerId, {
      starter: starterToReplaceWith,
    });
    alertStore.update({ state: AlertState.CAN_CLOSE });
  } else if (playerTarget === PlayerTarget.custom) {
    // TODO - choose a player's starter to steal
  }
};

export default UpdateStarterRule;