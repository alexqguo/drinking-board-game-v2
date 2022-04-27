import rootStore from 'src/stores';
import {
  RuleSchema,
  RuleHandler,
  AlertState,
  OutcomeSchema,
  DiceRollType,
  AlertAction,
  ActionStatus,
} from 'src/types';
import { validateRequired, getHandlerForRule } from 'src/engine/rules';
import { sumNumbers } from 'src/utils';
import ActionStore from 'src/stores/ActionStore';

const DiceRollRule: RuleHandler = async (rule: RuleSchema) => {
  const { gameStore, alertStore, actionStore } = rootStore;
  const { diceRolls } = rule;

  if (!validateRequired(rule.diceRolls)) {
    console.error('diceRolls is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const { numRequired } = diceRolls!;
  const actions = ActionStore.createNDiceRollActionObjects({
    n: numRequired,
    ruleId: rule.id,
    status: ActionStatus.dependent,
    playerId: gameStore.game.currentPlayerId,
  });
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
  const { outcomes, numRequired } = rule.diceRolls!;
  const isDone = actions.every(a => !!a.value);

  if (isDone) {
    const rolls = actions.map((a: AlertAction) => a.value);
    const outcome = getOutcome(rule, rolls);

    if (outcome && numRequired === actions.length) {
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