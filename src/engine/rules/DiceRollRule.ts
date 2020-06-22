import rootStore from 'src/stores';
import { RuleSchema, RuleHandler, AlertState, OutcomeSchema, DiceRollType } from 'src/types';
import { validateRequired, getHandlerForRule } from 'src/engine/rules';
import { requireDiceRolls, getRollsFromAlertDiceRoll } from 'src/engine/alert';
import { sumNumbers } from 'src/utils';

const DiceRollRule: RuleHandler = async (rule: RuleSchema) => {
  const { alertStore } = rootStore;
  const { diceRolls } = rule;

  if (!validateRequired(rule.diceRolls)) {
    console.error('diceRolls is a required field', rule);
    alertStore.update({ state: AlertState.CAN_CLOSE });
    return;
  }

  const getOutcome = (rolls: number[]): OutcomeSchema | null => {
    let resultOutcome: OutcomeSchema | null = null;
    const { outcomes } = diceRolls!;
    if (!diceRolls || !outcomes) return null;

    const rollsToCheck: number[] = diceRolls.type === DiceRollType.cumulative ?
      [sumNumbers(rolls)] : rolls;

    // (from old version) TODO: check type here for allMatch
    rollsToCheck.forEach((r: number) => {
      outcomes?.forEach((outcome: OutcomeSchema) => {
        if (outcome.criteria.length && outcome.criteria.indexOf(r) !== -1) {
          resultOutcome = outcome;
        }
      });
    });

    return resultOutcome;
  }

  const { outcomes } = diceRolls!;
  const rollInfo = await requireDiceRolls(diceRolls?.numRequired || 1);
  const rolls = getRollsFromAlertDiceRoll(rollInfo);
  const outcome = getOutcome(rolls);

  if (outcome) {
    const handler = getHandlerForRule(outcome.rule);
    await alertStore.update({
      outcomeIdentifier: alertStore.alert.outcomeIdentifier + `|outcome:${outcomes?.indexOf(outcome)}`,
      choice: {},
      diceRolls: {},
      playerSelection: {
        isRequired: false,
        selectedId: '',
      }
    });
    handler(outcome.rule);
  } else {
    alertStore.update({ state: AlertState.CAN_CLOSE });
  }
};

export default DiceRollRule;