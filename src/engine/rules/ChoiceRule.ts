import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, ChoiceSchema } from 'src/types';
import { validateRequired, getHandlerForRule } from 'src/engine/rules';
import { requireDiceRolls, requireChoice } from 'src/engine/alert';

const ChoiceRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore } = rootStore;
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
  const choiceIndex = choices?.findIndex((c: ChoiceSchema) => c.rule === choice); // This is kinda shitty...
  const handler = getHandlerForRule(choice);

  // Trigger the next rule and reset the alert actions
  await alertStore.update({
    outcomeIdentifier: alertStore.alert.outcomeIdentifier + `|choice:${choiceIndex}`,
    choice: {},
    diceRolls: {},
    playerSelection: {
      isRequired: false,
      selectedId: '',
      candidateIds: [],
    }
  });

  handler(choice);
};

export default ChoiceRule;