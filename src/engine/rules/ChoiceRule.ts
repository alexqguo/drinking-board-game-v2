import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState } from 'src/types';
import { validateRequired } from 'src/engine/rules';
import { requireDiceRolls, requireChoice } from '../alert';

const ChoiceRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, playerStore, gameStore } = rootStore;
  const { choices, diceRolls } = rule;

  if (!validateRequired(choices)) {
    console.error('choices is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  if (diceRolls) {
    // I think this is only used for the Sabrina space on gen 1. There's no actual effect
    await requireDiceRolls(diceRolls.numRequired);
  }

  const choice = await requireChoice(choices!);
  console.log(choice);

  alertStore.update({ state: AlertState.CAN_CLOSE });
};

export default ChoiceRule;