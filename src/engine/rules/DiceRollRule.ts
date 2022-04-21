import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertState,
  OutcomeSchema,
  DiceRollType,
  AlertAction,
  ActionStatus,
  ActionType,
} from 'src/types';
import { validateRequired, getHandlerForRule } from 'src/engine/rules';
import { createId, sumNumbers } from 'src/utils';

const DiceRollRule: RuleHandler = async (rule: RuleSchema) => {
  const { gameStore, alertStore, actionStore } = rootStore;
  const { diceRolls } = rule;

  if (!validateRequired(rule.diceRolls)) {
    console.error('diceRolls is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const { numRequired } = diceRolls!;
  const actions: AlertAction[] = [];
  for(let i = 0; i < numRequired; i++) {
    actions.push({
      id: createId('alert'),
      playerId: gameStore.game.currentPlayerId,
      status: ActionStatus.dependent,
      type: ActionType.roll,
      value: null,
    });
  }
  await actionStore.createNewActions(actions);
};

const getOutcome = (rule: RuleSchema, rolls: number[]): OutcomeSchema | null => {
  const { diceRolls } = rule;
  const { outcomes } = diceRolls!;
  if (!diceRolls || !outcomes) return null;

  let resultOutcome: OutcomeSchema | null = null;
  const rollsToCheck: number[] = diceRolls.type === DiceRollType.cumulative ?
    [sumNumbers(rolls)] : rolls;

  // Using tradition for loops in order to return early for an isAny match
  for (let i = 0; i < rollsToCheck.length; i++) {
    const roll = rollsToCheck[i];
    for (let j = 0; j < outcomes.length; j++) {
      const outcome = outcomes[j];

      // (from old version) TODO: check type here for allMatch. Not used in DiceRollRule currently
      if (outcome.criteria.length && outcome.criteria.indexOf(roll) !== -1) {
        resultOutcome = outcome;

        // If there is an any rule, return it immediately because that is the match
        if (outcome.isAny) {
          return outcome;
        }
      }
    }
  }

  return resultOutcome;
}

DiceRollRule.postActionHandler = async (rule: RuleSchema, actions: AlertAction[]) => {
  const { alertStore } = rootStore;
  const { outcomes } = rule.diceRolls!;
  const isDoneRolling = actions.filter(a => !!a.value).length === rule.diceRolls?.numRequired;

  if (isDoneRolling) {
    const rolls = actions.map(a => a.value);
    const outcome = getOutcome(rule, rolls);

    if (outcome) {
      const handler = getHandlerForRule(outcome.rule);
      await alertStore.update({
        outcomeIdentifier: alertStore.alert.outcomeIdentifier + `|outcome:${outcomes?.indexOf(outcome)}`,
      });
      handler(outcome.rule);
    } else {
      alertStore.update({ state: AlertState.CAN_CLOSE });
    }
  }
};

export default DiceRollRule;