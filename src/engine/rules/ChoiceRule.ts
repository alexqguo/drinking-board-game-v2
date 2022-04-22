import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, ChoiceSchema, AlertAction, ActionType, ActionStatus } from 'src/types';
import { validateRequired, getHandlerForRule } from 'src/engine/rules';
import ActionStore from 'src/stores/ActionStore';
import { createId } from 'src/utils';

const ChoiceRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore, gameStore, actionStore } = rootStore;
  const { choices, diceRolls } = rule;

  if (!validateRequired(choices)) {
    console.error('choices is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const actions: AlertAction[] = [];

  if (diceRolls) {
    // I think this is only used for the Sabrina space on gen 1. There's no actual effect
    actions.push(...ActionStore.createNDiceRollActionObjects({
      n: diceRolls.numRequired,
      playerId: gameStore.game.currentPlayerId,
    }));
  }

  const choiceIndexes: string[] = choices!.map((c: ChoiceSchema, i: number) => String(i));

  actions.push({
    id: createId('choice'),
    playerId: gameStore.game.currentPlayerId,
    type: ActionType.choice,
    status: ActionStatus.dependent,
    value: null,
    candidateIds: choiceIndexes,
  });
  actionStore.createNewActions(actions);
};

ChoiceRule.postActionHandler = async (rule: RuleSchema, actions: AlertAction[]) => {
  const { alertStore } = rootStore;
  const isDone = actions.every(a => !!a.value);

  if (isDone) {
    const choiceIndex = Number(actions.find(a => a.type === ActionType.choice)?.value);
    const choice = rule.choices![choiceIndex];
    const handler = getHandlerForRule(choice.rule);

    await alertStore.update({
      outcomeIdentifier: alertStore.alert.outcomeIdentifier + `|choice:${choiceIndex}`,
    });

    handler(choice.rule);
  }
};

export default ChoiceRule;