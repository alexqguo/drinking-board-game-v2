import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';
import { validateRequired } from '.';

const SkipNextMandatoryRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, playerStore, gameStore } = rootStore;

  if (!validateRequired(rule.numSpaces)) {
    console.error('numSpaces is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  await playerStore.updateEffects(gameStore.game.currentPlayerId, {
    mandatorySkips: rule.numSpaces, // Yes, overwrite existing
  });
  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default SkipNextMandatoryRule;