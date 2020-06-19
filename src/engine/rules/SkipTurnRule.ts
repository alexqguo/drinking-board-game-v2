import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';
import { validateRequiredFields } from 'src/engine/rules';
import en from 'src/i18n/en_US.json';

const SkipTurnRule: RuleHandler = (rule: RuleSchema) => {
  const { alertStore, playerStore, gameStore } = rootStore;
  const { numTurns } = rule;

  if (!validateRequiredFields(numTurns)) {
    console.error('numTurns is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  playerStore.updateEffects(gameStore.game.currentPlayerId, {
    skippedTurns: {
      numTurns: numTurns!,
      message: en.lostTurn.general,
    }
  });

  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default SkipTurnRule;