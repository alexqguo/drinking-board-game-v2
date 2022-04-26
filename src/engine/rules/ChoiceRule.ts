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
      ruleId: rule.id,
      playerId: gameStore.game.currentPlayerId,
    }));
  }

  const choiceIndexes: string[] = choices!.map((c: ChoiceSchema, i: number) => String(i));

  actions.push({
    id: createId('choice'),
    ruleId: rule.id,
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
    const priorNumChoices = alertStore.alert.outcomeIdentifier.split('|').filter(o => !!o).length;
    const numChoiceActions = actions.filter(a => a.type === ActionType.choice).length;

    const choiceIndex = Number(actions.find(a => a.type === ActionType.choice && a.ruleId === rule.id)?.value);
    const choice = rule.choices![choiceIndex];
    const handler = getHandlerForRule(choice.rule);

    /**
     * If a choice rule outcome is a separate rule which has its own actions, we need this check here
     * to ensure this code doesn't run twice once the subsequent actions get updated.
     * This may not work very well with nested ChoiceRules. Or maybe it would. Who knows!
     */
    if (numChoiceActions > priorNumChoices) {
      await alertStore.update({
        outcomeIdentifier: alertStore.alert.outcomeIdentifier + `|choice:${choiceIndex}`,
      });

      handler(choice.rule);
    } else if (handler.postActionHandler) {
      handler.postActionHandler(choice.rule, actions);
    }
  }
};

export default ChoiceRule;